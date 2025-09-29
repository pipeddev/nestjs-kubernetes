import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { JSendExceptionFilter } from './common/filters/jsend-exception.filter';
import { JSendInterceptor } from './common/interceptors/jsend.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { StructuredValidationSafePipe } from './common/pipes/structured-validation.pipe';
import { TraceLogger } from './common/logger/trace.logger';

async function bootstrap() {
  const logger = new TraceLogger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.enableCors({
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
    new StructuredValidationSafePipe(),
  );

  // Aplicar filtros y interceptors JSend globalmente
  app.useGlobalFilters(new JSendExceptionFilter());
  app.useGlobalInterceptors(new JSendInterceptor(app.get(Reflector)));

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  logger.log(`Application is running on: http://${host}:${port}`);
  logger.log(`GraphQL Playground: http://${host}:${port}/graphql`);
}
void bootstrap();
