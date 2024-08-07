const { connect, Connection, Channel } = require('amqplib');

class RabbitMQPublisher {
    constructor(url) {
        this.url = url;
        this.conn = null;
        this.channel = null;
    }

    async connect() {
        this.conn = await connect(this.url);
        this.channel = await this.conn.createChannel();
    }

    async publish(queue, message) {
        if (!this.channel) {
            throw new Error('Cannot publish message. Channel not initialized.');
        }

        await this.channel.assertQueue(queue, { durable: false });
        return this.channel.sendToQueue(queue, Buffer.from(message));
    }

    async close() {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.conn) {
            await this.conn.close();
        }
    }
}

module.exports = RabbitMQPublisher;
