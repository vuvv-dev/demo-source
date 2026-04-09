import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly emptyMessage: Locator;
  readonly checkoutButton: Locator;
  readonly removeItemButtons: Locator;
  readonly quantityInputs: Locator;
  readonly totalPrice: Locator;
  readonly cartCount: Locator;
  readonly continueShoppingLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('[data-testid="cart-item"], .cart-item');
    this.emptyMessage = page.locator('text=/Giỏ hàng trống|Chưa có sản phẩm|Không có sản phẩm/i');
    this.checkoutButton = page.locator('a[href="/checkout"], button:has-text("Thanh toán"), button:has-text("Checkout")').first();
    this.removeItemButtons = page.locator('button:has-text("Xóa"), button:has-text("Remove")');
    this.quantityInputs = page.locator('input[type="number"]');
    this.totalPrice = page.locator('text=/\\d{1,3}(\\.\\d{3})*₫/).last();
    this.cartCount = page.locator('[data-testid="cart-count"], span[class*="cart"]');
    this.continueShoppingLink = page.locator('a[href="/products"], a[href="/"]');
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async expectCartNotEmpty() {
    await this.cartItems.first().waitFor({ state: 'visible', timeout: 5000 });
  }

  async expectCartEmpty() {
    await this.emptyMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async updateQuantity(itemIndex: number, quantity: number) {
    const inputs = this.quantityInputs;
    await inputs.nth(itemIndex).fill(String(quantity));
    await this.page.waitForTimeout(500);
  }

  async removeItem(itemIndex: number) {
    await this.removeItemButtons.nth(itemIndex).click();
    await this.page.waitForTimeout(500);
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }
}
