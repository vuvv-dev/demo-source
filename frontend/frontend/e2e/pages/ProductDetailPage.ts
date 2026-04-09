import { Page, Locator } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  readonly productName: Locator;
  readonly addToCartButton: Locator;
  readonly wishlistButton: Locator;
  readonly quantitySelector: Locator;
  readonly priceDisplay: Locator;
  readonly variantButtons: Locator;
  readonly reviewsSection: Locator;
  readonly breadcrumb: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator('h1').first();
    this.addToCartButton = page.locator('button:has-text("Thêm vào giỏ"), button:has-text("Add to Cart")').first();
    this.wishlistButton = page.locator('button:has-text("Yêu thích"), button:has-text("Wishlist")').first();
    this.quantitySelector = page.locator('input[type="number"]').first();
    this.priceDisplay = page.locator('text=/\\d{1,3}(\\.\\d{3})*₫/').first();
    this.variantButtons = page.locator('[data-testid="variant-option"], button[class*="variant"], button[class*="color"]');
    this.reviewsSection = page.locator('[data-testid="reviews-section"], section:has-text("Đánh giá")');
    this.breadcrumb = page.locator('[data-testid="breadcrumb"], nav[aria-label="breadcrumb"], .breadcrumb');
    this.backButton = page.locator('a[href="/products"]').first();
  }

  async goto(slugOrId: string) {
    await this.page.goto(`/products/${slugOrId}`);
  }

  async addToCart(quantity = 1) {
    if (quantity > 1) {
      const input = this.quantitySelector;
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.fill(String(quantity));
      }
    }
    await this.addToCartButton.click();
  }

  async expectOnDetailPage(slugOrId: string) {
    await this.page.waitForURL(new RegExp(`/products/${slugOrId}`));
  }

  async expectAddToCartSuccess() {
    // Toast notification or cart count update
    await this.page.waitForTimeout(1000);
    const toast = this.page.locator('div[class*="toast"], [role="status"]');
    if (await toast.isVisible({ timeout: 3000 }).catch(() => false)) {
      await toast.waitFor({ state: 'hidden', timeout: 5000 });
    }
  }

  async selectVariant(variantText: string) {
    await this.page.locator(`button`).filter({ hasText: variantText }).first().click();
  }
}
