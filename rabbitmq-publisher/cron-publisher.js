const RabbitMQPublisher = require('./rabbitmq-publisher');
const cron = require('node-cron');
const { Logger } = require('@nestjs/common');

// --- CONFIG
const CHANNEL = "gas-price-update";
const RABBIT_MQ_ENDPOINT_DEV = 'amqp://localhost';
const GAS_PRICE_CRON_SCHEDULE_INTERVAL = "*/7 * * * * *";

const logger = new Logger('CronJob');

// Function to stop all scheduled cron jobs
function stopAllCronJobs() {
    const tasks = cron.getTasks();
    tasks.forEach(task => task.stop());
    logger.log('Stopped all previous cron jobs');
}

async function publishToGasPriceUpdate(msg) {
    let publisher;
    try {
        publisher = new RabbitMQPublisher(RABBIT_MQ_ENDPOINT_DEV);
        await publisher.connect();
        const published = await publisher.publish(CHANNEL, JSON.stringify(msg));
        logger.log(`Message published to ${CHANNEL}: ${published}`);
    } catch (error) {
        logger.error('Error publishing message:', error);
        throw new Error('Error:', error);
    } finally {
        if (publisher) {
            await publisher.close();
        }
    }
}

stopAllCronJobs(); // Stop all previous cron jobs before scheduling a new one
logger.log('Running scheduled Gas Price update');
const scheduledTask = cron.schedule(GAS_PRICE_CRON_SCHEDULE_INTERVAL, async () => {
    await publishToGasPriceUpdate({});
});

// Function to handle shutdown
function shutdown(signal) {
    logger.log(`Received ${signal}. Shutting down gracefully...`);
    scheduledTask.stop(); // Stop the current scheduled task
    stopAllCronJobs(); // Ensure all cron jobs are stopped
    process.exit(0); // Exit the process
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
