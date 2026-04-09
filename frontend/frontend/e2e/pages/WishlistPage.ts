import { Page, Locator } from '@playwright/test';

export class WishlistPage {
  readonly page: Page;
  readonly wishlistItems: Locator;
  readonly emptyMessage: Locator;
  readonly addToCartButtons: Locator;
  readonly removeButtons: Locator;
  readonly continueShoppingLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.wishlistItems = page.locator('[data-testid="wishlist-item"], .wishlist-item');
    this.emptyMessage = page.locator('text=/Danh sách yêu thích trống|Chưa có sản phẩm yêu thích/i');
    this.addToCartButtons = page.locator('button:has-text("Thêm vào giỏ"), button:has-text("Add to Cart")');
    this.removeButtons = page.locator('button:has-text("Xóa khỏi yêu thích"), button:has-text("Remove")');
    this.continueShoppingLink = page.locator('a:has-text("Tiếp tục mua sắm"), a:has-text("Mua sắm ngay")').first();
  }

  async goto() {
    await this.page.goto('/wishlist');
  }

  async expectWishlistNotEmpty() {
    await this.wishlistItems.first().waitFor({ state: 'visible', timeout: 5000 });
  }

  async expectWishlistEmpty() {
    await this.emptyMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async addFirstToCart() {
    const btn = this.addToCartButtons.first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
    }
  }

  async removeFirstItem() {
    const btn = this.removeButtons.first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await this.page.waitForTimeout(500);
    }
  }
}
