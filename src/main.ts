import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { JSendExceptionFilter } from './common/filters/jsend-exception.filter';
import { JSendInterceptor } from './common/interceptors/jsend.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { StructuredValidationSafePipe } from './common/pipes/structured-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Configurar CORS
  /*await app.register(require('@fastify/cors'), {
    origin: true,
  });*/
  app.useGlobalPipes(new StructuredValidationSafePipe());
  // Configurar validación global (puedes mantener tu JSendValidationPipe o usar el estándar)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Aplicar filtros y interceptors JSend globalmente
  app.useGlobalFilters(new JSendExceptionFilter());
  app.useGlobalInterceptors(new JSendInterceptor(app.get(Reflector)));

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`📊 GraphQL Playground: http://${host}:${port}/graphql`);
}
void bootstrap();
