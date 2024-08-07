const RabbitMQPublisher = require('./rabbitmq-publisher');
const cron = require('node-cron');

// --- CONFIG
const CHANNEL = "gas-price-update";
const RABBIT_MQ_ENDPOINT_DEV = 'amqp://localhost';
const GAS_PRICE_CRON_SCHEDULE_INTERVAL = "*/7 * * * * *";

async function publishToGasPriceUpdate(msg) {
    try {
        const publisher = new RabbitMQPublisher(RABBIT_MQ_ENDPOINT_DEV);
        await publisher.connect();
        const published = await publisher.publish(CHANNEL, JSON.stringify(msg));
    } catch (error) {
        throw new Error('Error:', error);
    } finally {
        await publisher.close();
    }
}

function scheduleGasPriceUpdate() {
    cron.schedule(GAS_PRICE_CRON_SCHEDULE_INTERVAL, async () => {
        await publishToGasPriceUpdate({});
    });
}

scheduleGasPriceUpdate();
