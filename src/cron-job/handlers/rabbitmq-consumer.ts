import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';
import {ERROR_MESSAGES} from "../../../config/constants";

class RabbitMQConsumer {
    private conn: Connection | null = null;
    private channel: Channel | null = null;

    constructor(private url: string) {}

    async connect(): Promise<void> {
        this.conn = await connect(this.url);
        this.channel = await this.conn.createChannel();
    }

    async consume(queue: string, onMessage: (msg: ConsumeMessage | null) => void): Promise<void> {
        if (!this.channel) {
            throw new Error(ERROR_MESSAGES.MESSAGE_CONSUME_ERROR);
        }

        await this.channel.assertQueue(queue, { durable: false });
        await this.channel.consume(queue, onMessage, { noAck: true });
    }

    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.conn) {
            await this.conn.close();
        }
    }
}

export default RabbitMQConsumer;