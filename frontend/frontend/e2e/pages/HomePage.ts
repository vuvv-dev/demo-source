import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly navbar: Locator;
  readonly categoryLinks: Locator;
  readonly productCards: Locator;
  readonly heroSection: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.locator('header');
    this.categoryLinks = page.locator('nav a[href*="categorySlug"]');
    this.productCards = page.locator('.product-card');
    this.heroSection = page.locator('section').first();
    this.searchButton = page.locator('[aria-label="Mở tìm kiếm"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickCategory(slug: string) {
    await this.page.locator(`a[href*="categorySlug=${slug}"]`).first().click();
  }

  async expectOnProductsPage() {
    await this.page.waitForURL(/\/products/);
  }

  async expectCategoryHighlighted(slug: string) {
    const link = this.page.locator(`a[href*="categorySlug=${slug}"]`).first();
    await link.waitFor({ state: 'visible' });
  }
}
