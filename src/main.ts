import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet'; // Security middleware for setting various HTTP headers.
import { ConfigService } from '@nestjs/config'; // Service for accessing environment variables and configurations.
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Tools for setting up Swagger documentation.
import { SWAGGER } from '../config/constants'; // Custom constants for Swagger configuration.

async function bootstrap() {
  // Create an instance of the NestJS application using the AppModule.
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap'); // Logger instance for bootstrapping messages.

  app.use(helmet()); // Apply Helmet middleware globally for security enhancements.

  // Use a global validation pipe with strict settings to ensure data validation.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Enable CORS for the application with specific settings.
  app.enableCors({
    origin: '*', // Allow requests from any origin. Consider restricting this in production.
    methods: 'GET', // Specify allowed methods. Add more if necessary.
    preflightContinue: false, // Stop the OPTIONS preflight from being passed to the route handler.
    optionsSuccessStatus: 204, // Respond with 204 status for OPTIONS requests.
  });

  // Swagger configuration for API documentation.
  const config = new DocumentBuilder()
    .setTitle(SWAGGER.API.TITLE)
    .setDescription(SWAGGER.API.DESCRIPTION)
    .setVersion(SWAGGER.API.VERSION)
    .addTag(SWAGGER.API.TAG)
    .build();

  // Create Swagger documentation with the defined configuration.
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Serve Swagger documentation at the /api endpoint.

  // Retrieve the ConfigService to access environment variables.
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') || 3000); // Start the application on the specified port or default to 3000.

  // Define a function to handle graceful shutdowns.
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, closing app...`);
    await app.close(); // Close the NestJS application gracefully.
    logger.log('App closed');
    process.exit(0); // Exit the process after shutting down the application.
  };

  // Listen for termination signals (SIGTERM and SIGINT) to trigger graceful shutdown.
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
bootstrap(); // Invoke the bootstrap function to start the application.
