import { connect, Connection, Channel } from 'amqplib';

/**
 * RabbitMQPublisher is a class responsible for managing connections 
 * to a RabbitMQ server and publishing messages to a specific queue.
 */
export class RabbitMQPublisher {
    private url: string;
    private conn: Connection | null = null;
    private channel: Channel | null = null;

    /**
     * Constructor to initialize the RabbitMQPublisher.
     *
     * @param {string} url - The URL of the RabbitMQ server to connect to.
     */
    constructor(url: string) {
        this.url = url;
    }

    /**
     * Establishes a connection to the RabbitMQ server and creates a channel.
     *
     * @throws {Error} - Throws an error if the connection or channel creation fails.
     */
    async connect(): Promise<void> {
        try {
            this.conn = await connect(this.url); // Establish a connection to the RabbitMQ server
            this.channel = await this.conn.createChannel(); // Create a channel on the established connection
        } catch (error) {
            throw new Error(`Failed to connect to RabbitMQ: ${error.message}`);
        }
    }

    /**
     * Publishes a message to a specified queue.
     *
     * @param {string} queue - The name of the queue to which the message will be sent.
     * @param {string} message - The message to be published, which will be converted to a Buffer.
     * @returns {boolean} - Returns true if the message is successfully sent to the queue.
     * @throws {Error} - Throws an error if the channel is not initialized.
     */
    async publish(queue: string, message: string): Promise<boolean> {
        if (!this.channel) {
            throw new Error('Cannot publish message. Channel not initialized.');
        }

        // Ensure the queue exists, and is durable (survives broker restarts)
        await this.channel.assertQueue(queue, { durable: false });

        // Publish the message to the specified queue
        return this.channel.sendToQueue(queue, Buffer.from(message));
    }

    /**
     * Closes the channel and connection to the RabbitMQ server.
     */
    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
        }

        if (this.conn) {
            await this.conn.close();
        }
    }
}
