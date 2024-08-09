import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';
import { ERROR_MESSAGES } from "../../../config/constants";

/**
 * RabbitMQConsumer is a utility class for connecting to and consuming messages from a RabbitMQ queue.
 */
class RabbitMQConsumer {
    private conn: Connection | null = null;
    private channel: Channel | null = null;

    /**
     * Constructs a new RabbitMQConsumer instance.
     * 
     * @param url - The RabbitMQ server URL.
     */
    constructor(private url: string) {}

    /**
     * Establishes a connection to the RabbitMQ server and creates a channel.
     * 
     * @throws Error if the connection or channel creation fails.
     */
    async connect(): Promise<void> {
        this.conn = await connect(this.url);  // Connect to the RabbitMQ server.
        this.channel = await this.conn.createChannel();  // Create a channel on the connection.
    }

    /**
     * Consumes messages from the specified queue.
     * 
     * @param queue - The name of the queue to consume messages from.
     * @param onMessage - A callback function to handle the consumed messages.
     * 
     * @throws Error if the channel is not initialized or if there is an error consuming messages.
     */
    async consume(queue: string, onMessage: (msg: ConsumeMessage | null) => void): Promise<void> {
        if (!this.channel) {
            throw new Error(ERROR_MESSAGES.MESSAGE_CONSUME_ERROR);  // Throw an error if the channel is not initialized.
        }

        await this.channel.assertQueue(queue, { durable: false });  // Ensure the queue exists.
        await this.channel.consume(queue, onMessage, { noAck: true });  // Consume messages from the queue.
    }

    /**
     * Closes the channel and connection to RabbitMQ.
     * 
     * @throws Error if there is an issue closing the channel or connection.
     */
    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();  // Close the channel.
        }
        if (this.conn) {
            await this.conn.close();  // Close the connection.
        }
    }
}

export default RabbitMQConsumer;
