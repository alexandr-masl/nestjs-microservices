// Import necessary modules and classes
const RabbitMQPublisher = require('./rabbitmq-publisher'); // Custom RabbitMQ publisher module
const cron = require('node-cron'); // Node.js cron job scheduler
const { Logger } = require('@nestjs/common'); // NestJS Logger for logging messages

// --- CONFIGURATION CONSTANTS --- //

// The name of the RabbitMQ channel to publish gas price updates
const CHANNEL = "gas-price-update";

// RabbitMQ endpoint URL for the development environment
// const RABBIT_MQ_ENDPOINT_DEV = 'amqp://localhost';
const RABBIT_MQ_ENDPOINT_DEV = "amqp://guest:guest@rabbitmq"

// Cron schedule interval for gas price updates
// This cron schedule runs the task every 7 seconds
const GAS_PRICE_CRON_SCHEDULE_INTERVAL = "*/7 * * * * *";

// Logger instance for logging messages with a specific context
const logger = new Logger('CronJob');

// --- FUNCTION DEFINITIONS --- //

/**
 * Function to stop all currently scheduled cron jobs.
 * This is useful to ensure that no multiple cron jobs are running concurrently.
 */
function stopAllCronJobs() {
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
async function publishToGasPriceUpdate(msg) {
    let publisher;
    try {
        publisher = new RabbitMQPublisher(RABBIT_MQ_ENDPOINT_DEV); // Create a new RabbitMQPublisher instance
        await publisher.connect(); // Connect to the RabbitMQ server
        const published = await publisher.publish(CHANNEL, JSON.stringify(msg)); // Publish the message to the channel
        logger.log(`Message published to ${CHANNEL}: ${published}`); // Log success message
    } catch (error) {
        logger.error('Error publishing message:', error); // Log any errors encountered during publishing
        throw new Error('Error:', error); // Re-throw the error
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
const scheduledTask = cron.schedule(GAS_PRICE_CRON_SCHEDULE_INTERVAL, async () => {
    await publishToGasPriceUpdate({}); // Call the publish function at the scheduled interval
});

/**
 * Handles the shutdown of the application.
 *
 * @param {string} signal - The signal received by the process, e.g., 'SIGTERM' or 'SIGINT'.
 */
function shutdown(signal) {
    logger.log(`Received ${signal}. Shutting down gracefully...`);
    scheduledTask.stop(); // Stop the current scheduled task
    stopAllCronJobs(); // Ensure all cron jobs are stopped
    process.exit(0); // Exit the process
}

// Listen for system signals to gracefully shut down the cron job
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
