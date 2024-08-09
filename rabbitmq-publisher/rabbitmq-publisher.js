// Import the 'connect' function from the 'amqplib' library
const { connect } = require('amqplib');

/**
 * RabbitMQPublisher is a class responsible for managing connections 
 * to a RabbitMQ server and publishing messages to a specific queue.
 */
class RabbitMQPublisher {
    /**
     * Constructor to initialize the RabbitMQPublisher.
     *
     * @param {string} url - The URL of the RabbitMQ server to connect to.
     */
    constructor(url) {
        this.url = url; // URL of the RabbitMQ server
        this.conn = null; // Holds the connection object
        this.channel = null; // Holds the channel object
    }

    /**
     * Establishes a connection to the RabbitMQ server and creates a channel.
     *
     * @throws {Error} - Throws an error if the connection or channel creation fails.
     */
    async connect() {
        // Establish a connection to the RabbitMQ server
        this.conn = await connect(this.url);

        // Create a channel on the established connection
        this.channel = await this.conn.createChannel();
    }

    /**
     * Publishes a message to a specified queue.
     *
     * @param {string} queue - The name of the queue to which the message will be sent.
     * @param {string} message - The message to be published, which will be converted to a Buffer.
     * @returns {boolean} - Returns true if the message is successfully sent to the queue.
     * @throws {Error} - Throws an error if the channel is not initialized.
     */
    async publish(queue, message) {
        // Ensure the channel is initialized before publishing
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
    async close() {
        // Close the channel if it is open
        if (this.channel) {
            await this.channel.close();
        }

        // Close the connection if it is open
        if (this.conn) {
            await this.conn.close();
        }
    }
}

// Export the RabbitMQPublisher class for use in other modules
module.exports = RabbitMQPublisher;
