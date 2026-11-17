import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(
    '/uploads',
    express.static(join(process.cwd(), 'uploads')),
  );

  app.setGlobalPrefix('api/v2');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true, 
  }))

  const config = new DocumentBuilder()
  .setTitle('Metrorin Backend API')
  .setDescription('Telecom Network Mapping Platform API')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'JWT',
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);

  if (process.env.NODE_ENV === 'development') {
    SwaggerModule.setup('docs', app, document, {
      useGlobalPrefix: true,
    });
  }

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port') ?? 2999;

  await app.listen(port, '0.0.0.0');

  console.log(`Server is running.`);
}
bootstrap();
