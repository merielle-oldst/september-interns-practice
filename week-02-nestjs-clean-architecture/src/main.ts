import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './projects/presentation/domain-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Boundary validation: reject request bodies that do not match the DTOs.
  // `whitelist` strips unknown fields; `transform` gives you real DTO instances.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Turn domain errors into the right HTTP status codes.
  app.useGlobalFilters(new DomainExceptionFilter());

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Projects API listening on http://localhost:${port}`);
}

void bootstrap();
