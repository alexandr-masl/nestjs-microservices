const RabbitMQPublisher = require('./rabbitmq-publisher');
const cron = require('node-cron');

async function publishToSatoshiCandlesChannel(msg) {
    const CHANNEL = 'gas-price-update';
    const rabbitUrl = 'amqp://localhost';
    const publisher = new RabbitMQPublisher(rabbitUrl);

    try {
        await publisher.connect();

        console.log('--- Publishing new MSG to -> #gas-price-update');

        const published = await publisher.publish(CHANNEL, JSON.stringify(msg));

        console.log('--- Message has been published:', published);
        console.log('------------------------------\n\n');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await publisher.close();
    }
}

function scheduleGasPriceUpdate() {
    cron.schedule('*/7 * * * * *', async () => {
        await publishToSatoshiCandlesChannel({});
    });
}

scheduleGasPriceUpdate();
