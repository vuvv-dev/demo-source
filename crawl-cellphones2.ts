/**
 * Cellphones.com.vn Product Crawler
 * URL thực tế: https://cellphones.com.vn/mobile/apple.html
 *
 * Install:
 *   npm install playwright cheerio p-limit
 *   npx playwright install chromium
 *
 * Run:
 *   npx tsx cellphones-crawler.ts
 *   npx tsx cellphones-crawler.ts --category mobile/apple/iphone-16 --max-products 20
 *   npx tsx cellphones-crawler.ts --skip-details
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import fs from 'fs/promises';

// ─── Logger nhẹ, không cần pino-pretty ────────────────────────────────────────

const log = {
  info: (obj: object | string, msg?: string) => console.log(`[INFO] `, msg ?? obj, typeof obj === 'object' && msg ? obj : ''),
  warn: (obj: object | string, msg?: string) => console.warn(`[WARN] `, msg ?? obj, typeof obj === 'object' && msg ? obj : ''),
  error: (obj: object | string, msg?: string) => console.error(`[ERROR]`, msg ?? obj, typeof obj === 'object' && msg ? obj : ''),
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductSummary {
  id: string;
  name: string;
  category: string;
  slug: string;
  brand: string;
  price: number;
  priceFormatted: string;
  originalPrice?: number;
  originalPriceFormatted?: string;
  discount?: string;
  url: string;
  image: string;
  crawledAt: string;
}

interface Product extends ProductSummary {
  inStock: boolean;
  rating: number;
  reviews: number;
  images: string[];
  thumbnail: string;
  shortDescription?: string;
  description?: string;
  specs: Record<string, string>;
  promotions: string[];
  badges: string[];
  tags: string[];
}

interface CrawlStats {
  startedAt: string;
  finishedAt?: string;
  categories: Record<string, number>;
  totalProducts: number;
  errors: number;
  retries: number;
  details: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = 'https://cellphones.com.vn';

/**
 * Danh mục thực tế — URL xác nhận từ HTML cellphones.com.vn
 */
const CATS = [
  { name: 'iPhone (Tất cả)', slug: 'mobile/apple', url: `${BASE_URL}/mobile/apple.html` },
  { name: 'iPhone 17 Series', slug: 'mobile/apple/iphone-17', url: `${BASE_URL}/mobile/apple/iphone-17.html` },
  { name: 'iPhone Air', slug: 'mobile/apple/iphone-air', url: `${BASE_URL}/mobile/apple/iphone-air.html` },
  { name: 'iPhone 16 Series', slug: 'mobile/apple/iphone-16', url: `${BASE_URL}/mobile/apple/iphone-16.html` },
  { name: 'iPhone 15 Series', slug: 'mobile/apple/iphone-15', url: `${BASE_URL}/mobile/apple/iphone-15.html` },
  { name: 'iPhone 14 Series', slug: 'mobile/apple/iphone-14', url: `${BASE_URL}/mobile/apple/iphone-14.html` },
  { name: 'iPhone 13 Series', slug: 'mobile/apple/iphone-13', url: `${BASE_URL}/mobile/apple/iphone-13.html` },
];

const CONFIG = {
  concurrency: 2,       // số tab detail chạy song song — giữ thấp tránh bị block
  delayMin: 1000,
  delayMax: 2500,
  maxRetries: 3,
  retryDelay: 4000,
  pageTimeout: 45_000,
  scrollStep: 400,      // px mỗi bước scroll để trigger lazy load
  scrollDelay: 200,     // ms giữa mỗi bước scroll
  afterScrollWait: 2500,// ms đợi JS render sau khi scroll xong
  outputDir: './output',
  headless: true,       // đổi false để xem browser thật khi debug
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const randomDelay = () => sleep(CONFIG.delayMin + Math.random() * (CONFIG.delayMax - CONFIG.delayMin));

function parsePrice(raw: string): number {
  return parseInt(raw.replace(/[^\d]/g, ''), 10) || 0;
}

function extractSlug(href: string): string {
  return (href.split('/').pop() || '').replace('.html', '');
}

function normalizeImg(src: string): string {
  if (!src) return '';
  return src.startsWith('//') ? `https:${src}` : src;
}

async function withRetry<T>(fn: () => Promise<T>, label: string, stats: CrawlStats): Promise<T> {
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      stats.retries++;
      if (attempt === CONFIG.maxRetries) throw err;
      log.warn({ attempt, label }, `Retry ${attempt}/${CONFIG.maxRetries}`);
      await sleep(CONFIG.retryDelay * attempt);
    }
  }
  throw new Error('unreachable');
}

// ─── Browser ──────────────────────────────────────────────────────────────────

async function newListPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'vi-VN,vi;q=0.9' });
  // Block media để load nhanh hơn ở list page
  await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,otf}', r => r.abort());
  return page;
}

async function newDetailPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'vi-VN,vi;q=0.9' });
  return page;
}

/**
 * Cellphones dùng lazy load / infinite scroll.
 * Phải scroll hết trang mới load đủ sản phẩm — đây là bước quan trọng nhất.
 */
async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(
    ({ step, delay }: { step: number; delay: number }) =>
      new Promise<void>(resolve => {
        let scrolled = 0;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          scrolled += step;
          if (scrolled >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, delay);
      }),
    { step: CONFIG.scrollStep, delay: CONFIG.scrollDelay },
  );
  await page.waitForTimeout(CONFIG.afterScrollWait);
}

async function gotoPage(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: CONFIG.pageTimeout });
  await page.waitForTimeout(1500);
}

// ─── Phase 1: Danh sách sản phẩm ─────────────────────────────────────────────

async function scrapeList(
  page: Page,
  cat: (typeof CATS)[0],
  maxProducts?: number,
): Promise<ProductSummary[]> {
  log.info({ url: cat.url }, `Scraping danh mục: ${cat.name}`);

  await gotoPage(page, cat.url);
  await scrollToBottom(page);

  // Uncomment dòng dưới để dump HTML debug:
  // await fs.writeFile('./output/debug-list.html', await page.content());

  const $ = cheerio.load(await page.content());
  const summaries: ProductSummary[] = [];
  const seen = new Set<string>();
  const now = new Date().toISOString();

  /**
   * Từ HTML thực tế của cellphones.com.vn:
   *   <a href="/iphone-17-pro.html">
   *     <img data-src="https://cdn2.cellphones.com.vn/...png" />
   *     <h3>iPhone 17 Pro 256GB | Chính hãng</h3>
   *     <div class="product-price">34.490.000đ</div>
   *     <div class="price-old">34.990.000đ</div>
   *     <span>Giảm 1%</span>
   *   </a>
   */
  $('a[href$=".html"]').each((_, el) => {
    if (maxProducts && summaries.length >= maxProducts) return false as any;

    const $a = $(el);
    const href = $a.attr('href') || '';

    // Lọc bỏ link menu/danh mục — chỉ giữ link sản phẩm (không có sub-path)
    const cleanHref = href.startsWith('http') ? new URL(href).pathname : href;
    const parts = cleanHref.split('/').filter(Boolean);

    // Sản phẩm: /ten-san-pham.html (1 segment)
    // Danh mục: /mobile/apple/iphone-16.html (nhiều segment)
    if (parts.length !== 1) return;
    if (href.includes('/sforum') || href.includes('/tin-tuc')) return;

    // Phải có <h3> hoặc element chứa tên
    const name = $a.find('h3').first().text().trim();
    if (!name) return;

    const slug = extractSlug(cleanHref);
    if (seen.has(slug)) return;
    seen.add(slug);

    const productUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    // Thu thập tất cả text có chứa "đ" trong card
    const priceTexts: string[] = [];
    $a.find('*').each((_, child) => {
      const $c = $(child);
      if ($c.children().length === 0) { // leaf node
        const t = $c.text().trim();
        if (t.includes('đ') && /\d{4,}/.test(t)) priceTexts.push(t);
      }
    });

    const priceFormatted = priceTexts[0] || '';
    const price = parsePrice(priceFormatted);
    const originalPriceFormatted = priceTexts[1];
    const originalPrice = originalPriceFormatted ? parsePrice(originalPriceFormatted) : undefined;

    // Badge giảm giá
    const discountMatch = $a.text().match(/Giảm\s+\d+%/);
    const discount = discountMatch ? discountMatch[0] : undefined;

    // Ảnh — lazy load dùng data-src
    const imgEl = $a.find('img').first();
    const image = normalizeImg(
      imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || imgEl.attr('src') || '',
    );

    summaries.push({
      id: slug,
      name,
      category: cat.name,
      slug,
      brand: 'Apple',
      price,
      priceFormatted,
      originalPrice,
      originalPriceFormatted,
      discount,
      url: productUrl,
      image,
      crawledAt: now,
    });
  });

  log.info({ category: cat.name, count: summaries.length }, 'Scrape list done');
  return summaries;
}

// ─── Phase 2: Chi tiết sản phẩm ──────────────────────────────────────────────

async function scrapeDetail(page: Page, summary: ProductSummary): Promise<Product> {
  await gotoPage(page, summary.url);

  const $ = cheerio.load(await page.content());

  // ── Giá ──
  const priceFormatted =
    $('.box-info__box-price .price, [class*="price"]:not([class*="old"]):not([class*="install"])').first().text().trim()
    || summary.priceFormatted;
  const price = parsePrice(priceFormatted) || summary.price;

  const originalPriceFormatted =
    $('[class*="price-old"], [class*="old-price"]').first().text().trim()
    || summary.originalPriceFormatted;
  const originalPrice = originalPriceFormatted ? parsePrice(originalPriceFormatted) : undefined;

  // ── Tình trạng kho ──
  const stockText = $('[class*="status"], [class*="stock"], [class*="availability"]').text().toLowerCase();
  const inStock = !stockText.includes('hết hàng') && !stockText.includes('tạm hết');

  // ── Đánh giá ──
  const rating = parseFloat(
    $('[itemprop="ratingValue"]').attr('content')
    || $('[class*="rating-value"], [class*="star-value"]').first().text().trim()
    || '0',
  ) || 0;

  const reviews = parseInt(
    ($('[itemprop="reviewCount"]').attr('content')
      || $('[class*="review-count"], [class*="rating-count"]').first().text().replace(/[^\d]/g, '')
      || '0'),
    10,
  ) || 0;

  // ── Hình ảnh ──
  const images: string[] = [];
  $('[class*="gallery"] img, [class*="slider"] img, [class*="product-image"] img, .swiper-slide img').each((_, img) => {
    const src = normalizeImg(
      $(img).attr('data-src') || $(img).attr('data-lazy-src') || $(img).attr('src') || '',
    );
    if (src && !src.includes('placeholder') && !images.includes(src)) images.push(src);
  });
  const thumbnail = images[0] || summary.image;

  // ── Mô tả ──
  const shortDescription = $('[class*="short-desc"], [class*="product-intro"]').first().text().trim() || undefined;
  const description = $('[class*="product-description"] .content, #tab-description').first().text().trim() || undefined;

  // ── Thông số kỹ thuật ──
  const specs: Record<string, string> = {};
  $('table tr, [class*="specification"] [class*="item"], [class*="spec-row"]').each((_, row) => {
    const $row = $(row);
    const key = $row.find('td:first-child, th, [class*="label"]').first().text().trim();
    const val = $row.find('td:last-child, [class*="value"]').last().text().trim();
    if (key && val && key !== val) specs[key] = val;
  });

  // ── Khuyến mãi ──
  const promotions: string[] = [];
  $('[class*="promotion"] li, [class*="gift"] li, [class*="promo-list"] li').each((_, el) => {
    const t = $(el).text().trim();
    if (t) promotions.push(t);
  });

  // ── Badges ──
  const badges: string[] = [];
  $('[class*="badge"], [class*="sticker"], [class*="label-sale"]').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 60) badges.push(t);
  });

  // ── Tags ──
  const tags: string[] = [];
  $('[class*="tag"] a, [class*="keyword"] a').each((_, el) => {
    const t = $(el).text().trim();
    if (t) tags.push(t);
  });

  return {
    ...summary,
    price,
    priceFormatted,
    originalPrice,
    originalPriceFormatted,
    inStock,
    rating,
    reviews,
    images,
    thumbnail,
    shortDescription,
    description,
    specs,
    promotions,
    badges,
    tags,
    crawledAt: new Date().toISOString(),
  };
}

// ─── Phase 3: Save ────────────────────────────────────────────────────────────

async function saveOutput(summaries: ProductSummary[], details: Product[], stats: CrawlStats) {
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  await fs.writeFile(`${CONFIG.outputDir}/summaries.json`, JSON.stringify(summaries, null, 2));
  await fs.writeFile(`${CONFIG.outputDir}/products.json`, JSON.stringify(details, null, 2));

  stats.finishedAt = new Date().toISOString();
  await fs.writeFile(`${CONFIG.outputDir}/stats.json`, JSON.stringify(stats, null, 2));

  const csv = [
    'id,name,category,price,originalPrice,discount,url',
    ...summaries.map(s =>
      `"${s.id}","${s.name.replace(/"/g, "'")}","${s.category}",${s.price},${s.originalPrice ?? ''},${s.discount ?? ''},"${s.url}"`,
    ),
  ].join('\n');
  await fs.writeFile(`${CONFIG.outputDir}/summaries.csv`, csv);

  log.info(
    { summaries: summaries.length, details: details.length, dir: CONFIG.outputDir },
    '✅ Output saved',
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function crawl(options: {
  categorySlug?: string;
  maxProducts?: number;
  skipDetails?: boolean;
} = {}) {
  const stats: CrawlStats = {
    startedAt: new Date().toISOString(),
    categories: {},
    totalProducts: 0,
    errors: 0,
    retries: 0,
    details: 0,
  };

  const allSummaries: ProductSummary[] = [];
  const allDetails: Product[] = [];

  const targetCats = options.categorySlug
    ? CATS.filter(c => c.slug === options.categorySlug)
    : CATS;

  if (targetCats.length === 0) {
    log.error({}, `Không tìm thấy category: "${options.categorySlug}"`);
    log.info({}, `Slug hợp lệ:\n${CATS.map(c => `  ${c.slug}  →  ${c.url}`).join('\n')}`);
    process.exit(1);
  }

  log.info({}, `🚀 Start crawl | headless=${CONFIG.headless} | cats=${targetCats.length}`);

  const browser: Browser = await chromium.launch({ headless: CONFIG.headless });
  const context: BrowserContext = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });

  try {
    // ── Phase 1 ───────────────────────────────────────────────────────────
    const listPage = await newListPage(context);

    for (const cat of targetCats) {
      stats.categories[cat.name] = 0;
      try {
        const summaries = await withRetry(
          () => scrapeList(listPage, cat, options.maxProducts),
          `list:${cat.slug}`,
          stats,
        );
        allSummaries.push(...summaries);
        stats.categories[cat.name] = summaries.length;
        stats.totalProducts += summaries.length;
      } catch (err) {
        log.error({ err }, `Lỗi category: ${cat.name}`);
        stats.errors++;
      }
      await randomDelay();
    }

    await listPage.close();
    log.info({ total: allSummaries.length }, `📦 Thu thập xong ${allSummaries.length} sản phẩm`);

    if (options.skipDetails || allSummaries.length === 0) {
      await saveOutput(allSummaries, [], stats);
      return;
    }

    // ── Phase 2 ───────────────────────────────────────────────────────────
    log.info({}, `🔍 Crawl detail (concurrency=${CONFIG.concurrency})…`);
    const limit = pLimit(CONFIG.concurrency);

    await Promise.all(
      allSummaries.map(summary =>
        limit(async () => {
          await randomDelay();
          const dp = await newDetailPage(context);
          try {
            const product = await withRetry(
              () => scrapeDetail(dp, summary),
              `detail:${summary.slug}`,
              stats,
            );
            allDetails.push(product);
            stats.details++;
            log.info({ name: product.name, price: product.priceFormatted }, '✓ Detail');
          } catch (err) {
            log.error({ url: summary.url }, 'Lỗi detail');
            stats.errors++;
          } finally {
            await dp.close();
          }
        }),
      ),
    );

    // ── Phase 3 ───────────────────────────────────────────────────────────
    await saveOutput(allSummaries, allDetails, stats);

    const sec = ((Date.now() - new Date(stats.startedAt).getTime()) / 1000).toFixed(1);
    log.info(
      { total: stats.totalProducts, details: stats.details, errors: stats.errors, time: `${sec}s` },
      '🎉 Hoàn tất',
    );
  } finally {
    await browser.close();
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

(async () => {
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };

  await crawl({
    categorySlug: getArg('--category'),
    maxProducts: getArg('--max-products') ? parseInt(getArg('--max-products')!, 10) : undefined,
    skipDetails: args.includes('--skip-details'),
  });
})();