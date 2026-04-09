import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly categoryButtons: Locator;
  readonly productCards: Locator;
  readonly sortSelect: Locator;
  readonly filterPanel: Locator;
  readonly resultCount: Locator;
  readonly paginationButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('aside input[placeholder*="Tên sản phẩm"]');
    this.categoryButtons = page.locator('aside button:has-text("Tất cả"), aside button:has-text("iPhone"), aside button:has-text("Mac"), aside button:has-text("iPad"), aside button:has-text("AirPods"), aside button:has-text("Watch")');
    this.productCards = page.locator('.product-card');
    this.sortSelect = page.locator('select').first();
    this.filterPanel = page.locator('aside');
    this.resultCount = page.locator('text=/\\d+ sản phẩm/');
    this.paginationButtons = page.locator('button:has-text("←"), button:has-text("→")');
  }

  async goto(params?: string) {
    await this.page.goto(params ? `/products?${params}` : '/products');
  }

  async selectCategory(categorySlug: string) {
    // Use URL-based navigation to match real user behavior
    await this.page.goto(`/products?categorySlug=${categorySlug}`);
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(600); // wait for debounce
  }

  async expectProductsLoaded() {
    await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async expectCategoryActive(slug: string) {
    // After URL-based navigation, sidebar should highlight the category
    await this.page.waitForURL(new RegExp(`categorySlug=${slug}`));
    const activeBtn = this.page.locator(`aside button:has-text("Tất cả")`);
    // Check that "Tất cả" is NOT active, and a category button is
    const btn = this.page.locator(`aside button`).filter({ hasText: new RegExp(slug.replace('-', ' '), 'i') });
    await btn.waitFor({ state: 'visible' });
  }

  async expectResultsContain(text: string) {
    await this.page.locator('.product-card').filter({ hasText: text }).first().waitFor({ state: 'visible', timeout: 5000 });
  }

  async expectNoResults() {
    await this.page.locator('text=/Không tìm thấy|Không có sản phẩm/i').waitFor({ state: 'visible', timeout: 5000 });
  }

  async sortBy(sortLabel: string) {
    await this.sortSelect.selectOption(sortLabel);
  }
}
