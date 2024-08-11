// Import necessary modules and classes
import * as cron from 'node-cron'; // Node.js cron job scheduler
import { Logger } from '@nestjs/common'; // NestJS Logger for logging messages
import { RabbitMQPublisher } from './rabbitmq-publisher'; // Custom RabbitMQ publisher module
import { EVENTS, PATHS, CRON_CONFIG } from '../config/constants';
const logger = new Logger('CronJob');

// RabbitMQ production version check
const PRODUCTION = process.env.APP === 'PRODUCTION';

// RabbitMQ endpoint URL for the development environment
const RABBIT_MQ_ENDPOINT = PRODUCTION ? process.env.RABBIT_MQ_PRODUCTION_URL : PATHS.RABBIT_MQ_ENDPOINT_DEV;
logger.log(`Launching Container: ${PRODUCTION}`);

// Logger instance for logging messages with a specific context

// --- FUNCTION DEFINITIONS --- //

/**
 * Function to stop all currently scheduled cron jobs.
 * This is useful to ensure that no multiple cron jobs are running concurrently.
 */
function stopAllCronJobs(): void {
    const tasks = cron.getTasks();
    tasks.forEach(task => task.stop());
    logger.log('Stopped all previous cron jobs');
}

/**
 * Publishes a message to the 'gas-price-update' RabbitMQ channel.
 *
 * @param {Object} msg - The message object to be published. It will be stringified before sending.
 * @throws {Error} - Throws an error if the message publishing fails.
 */
async function publishToGasPriceUpdate(msg: object): Promise<void> {
    let publisher: RabbitMQPublisher | undefined;
    try {
        publisher = new RabbitMQPublisher(RABBIT_MQ_ENDPOINT); // Create a new RabbitMQPublisher instance
        await publisher.connect(); // Connect to the RabbitMQ server
        const published = await publisher.publish(EVENTS.GAS_PRICE_UPDATE, JSON.stringify(msg)); // Publish the message to the channel
        logger.log(`Message published to ${EVENTS.GAS_PRICE_UPDATE}: ${published}`); // Log success message
    } catch (error) {
        logger.error('Error publishing message:', error); // Log any errors encountered during publishing
        throw new Error(`Error: ${error.message}`); // Re-throw the error
    } finally {
        if (publisher) {
            await publisher.close(); // Ensure the connection is closed after publishing
        }
    }
}

// Stop all previous cron jobs before scheduling a new one
stopAllCronJobs();
logger.log('Running scheduled Gas Price update');

// Schedule the cron job for gas price updates using the defined interval
const scheduledTask = cron.schedule(CRON_CONFIG.GAS_PRICE_CRON_SCHEDULE_INTERVAL, async () => {
    await publishToGasPriceUpdate({}); // Call the publish function at the scheduled interval
});

/**
 * Handles the shutdown of the application.
 *
 * @param {string} signal - The signal received by the process, e.g., 'SIGTERM' or 'SIGINT'.
 */
function shutdown(signal: string): void {
    logger.log(`Received ${signal}. Shutting down gracefully...`);
    scheduledTask.stop(); // Stop the current scheduled task
    stopAllCronJobs(); // Ensure all cron jobs are stopped
    process.exit(0); // Exit the process
}

// Listen for system signals to gracefully shut down the cron job
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
