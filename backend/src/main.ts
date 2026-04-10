import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3001;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  app.enableCors({ origin: frontendUrl, credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Apple Store API')
    .setDescription('REST API for Apple Store e-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  // ── Clean & Seed on start ───────────────────────────────────────────────
  const dataSource = app.get(DataSource);
  console.log('🗑️ Dropping schema to clear all data...');
  await dataSource.synchronize(true); // true = drop schema and recreate

  console.log('📦 Running seed automatically...');
  const seedService = app.get(SeedService);
  await seedService.seed();

  await app.listen(port);
  console.log(`🚀 Backend running at http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
