import { Controller, Post, Get, Query } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private seedService: SeedService) {}

  @Post()
  async seed() {
    return this.seedService.seed();
  }

  @Get()
  async getSeedStatus() {
    return { status: 'ok', message: 'Seed endpoint active. POST to /api/seed to run.' };
  }

  @Post('clear')
  async clear() {
    await this.seedService.clearAll();
    return { success: true, message: 'All data cleared' };
  }
}
