import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly paymentMethods: Locator;
  readonly placeOrderButton: Locator;
  readonly orderSummary: Locator;
  readonly totalAmount: Locator;
  readonly noteInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('input[name="name"], input[placeholder*="tên"], input[id*="name"]').first();
    this.phoneInput = page.locator('input[name="phone"], input[placeholder*="điện thoại"]').first();
    this.addressInput = page.locator('input[name="address"], textarea[name="address"], input[placeholder*="địa chỉ"]').first();
    this.cityInput = page.locator('input[name="city"], select[name="city"], input[placeholder*="thành phố"]').first();
    this.paymentMethods = page.locator('[data-testid="payment-option"], .payment-option, input[name="paymentMethod"]');
    this.placeOrderButton = page.locator('button:has-text("Đặt hàng"), button:has-text("Place Order")').first();
    this.orderSummary = page.locator('[data-testid="order-summary"], .order-summary');
    this.totalAmount = page.locator('text=/Tổng tiền|Total.*\\d/i').first();
    this.noteInput = page.locator('textarea[name="note"], input[name="note"]').first();
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async fillShipping(name: string, phone: string, address: string, city: string) {
    if (await this.nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.nameInput.fill(name);
    }
    if (await this.phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.phoneInput.fill(phone);
    }
    if (await this.addressInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.addressInput.fill(address);
    }
    if (await this.cityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.cityInput.fill(city);
    }
  }

  async selectPayment(methodLabel: string) {
    const method = this.page.locator('.payment-option, [data-testid="payment-option"]').filter({ hasText: methodLabel }).first();
    if (await method.isVisible({ timeout: 2000 }).catch(() => false)) {
      await method.click();
    }
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  async expectOnSuccessPage() {
    await this.page.waitForURL(/\/checkout\/success/, { timeout: 15000 });
  }

  async expectErrorVisible() {
    await this.page.locator('text=/không thành công|lỗi|error/i').waitFor({ state: 'visible', timeout: 5000 });
  }
}
