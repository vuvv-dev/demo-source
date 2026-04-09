import { Page, Locator } from '@playwright/test';

export class OrderPage {
  readonly page: Page;
  readonly orderCards: Locator;
  readonly orderNumbers: Locator;
  readonly statusBadges: Locator;
  readonly cancelButtons: Locator;
  readonly viewDetailButtons: Locator;
  readonly searchInput: Locator;
  readonly filterTabs: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderCards = page.locator('.order-card, [data-testid="order-card"]');
    this.orderNumbers = page.locator('text=/#[A-Z0-9-]+/').first();
    this.statusBadges = page.locator('.badge-pending, .badge-confirmed, .badge-shipping, .badge-delivered, .badge-cancelled');
    this.cancelButtons = page.locator('button:has-text("Hủy")');
    this.viewDetailButtons = page.locator('a[href*="/orders/"]');
    this.searchInput = page.locator('input[placeholder*="mã đơn"]');
    this.filterTabs = page.locator('button:has-text("Tất cả"), button:has-text("Chờ xử lý"), button:has-text("Đang giao"), button:has-text("Đã giao")');
    this.emptyMessage = page.locator('text=/Chưa có đơn hàng|Không có đơn hàng/i');
  }

  async goto() {
    await this.page.goto('/orders');
  }

  async searchByOrderNumber(orderNumber: string) {
    await this.searchInput.fill(orderNumber);
    await this.page.waitForTimeout(300);
  }

  async filterByStatus(status: 'pending' | 'shipping' | 'delivered') {
    const tabMap = {
      pending: 'Chờ xử lý',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
    };
    await this.page.locator(`button:has-text("${tabMap[status]}")`).click();
  }

  async cancelFirstOrder() {
    const cancelBtn = this.cancelButtons.first();
    if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelBtn.click();
      await this.page.on('dialog', dialog => dialog.accept());
    }
  }

  async expectOrdersLoaded() {
    await this.page.waitForSelector('text=/Đơn hàng/', { timeout: 5000 });
  }

  async expectOrderCountGreaterThan(count: number) {
    const orderCount = await this.orderCards.count();
    if (orderCount <= count) {
      throw new Error(`Expected more than ${count} orders, got ${orderCount}`);
    }
  }
}
