# RabbitMQ Publisher with Cron Job

This module is responsible for publishing gas price update events to a RabbitMQ queue at regular intervals using a cron job. The events are consumed by the `CronJobModule`, which then fetches and updates the latest Ethereum gas price. This setup ensures that the gas price information remains current and can be accessed quickly by other parts of the application.

## Features

- **Scheduled Gas Price Update Events**: Utilizes `node-cron` to schedule the publishing of gas price update events at a defined interval.
- **RabbitMQ Integration**: Connects to a RabbitMQ server and publishes messages to a specified queue.
- **Graceful Shutdown**: Handles system signals to gracefully stop the cron job and close RabbitMQ connections.

## How It Works

1. **Cron Job Scheduling**: The module uses `node-cron` to schedule a task that runs every 7 seconds (configurable via `GAS_PRICE_CRON_SCHEDULE_INTERVAL`). The task publishes a gas price update event to a RabbitMQ queue.
  
2. **Message Publishing**: The `RabbitMQPublisher` class manages the connection to the RabbitMQ server and publishes messages to the specified queue. The messages are simple JSON objects, typically containing an empty object `{}` as a signal to update the gas price.

3. **Graceful Shutdown**: The module listens for system signals (`SIGTERM` and `SIGINT`) to gracefully stop the cron job and ensure that all RabbitMQ connections are closed properly before the application exits.

## Configuration

### Constants

- **`CHANNEL`**: The name of the RabbitMQ channel to which gas price updates are published. Default is `"gas-price-update"`.
- **`RABBIT_MQ_ENDPOINT_DEV`**: The RabbitMQ server endpoint URL for the development environment. Default is `'amqp://localhost'`.
- **`GAS_PRICE_CRON_SCHEDULE_INTERVAL`**: The cron schedule interval for publishing gas price updates. Default is `"*/7 * * * * *"`, which means every 7 seconds.

## Usage

### 1. Starting the Cron Job

When the module is loaded, it automatically stops any existing cron jobs and starts a new one based on the configured schedule (`GAS_PRICE_CRON_SCHEDULE_INTERVAL`). The cron job periodically calls the `publishToGasPriceUpdate` function, which publishes a message to the RabbitMQ queue.

```javascript
stopAllCronJobs(); // Stop all previous cron jobs
logger.log('Running scheduled Gas Price update');


### 2. Publishing Messages

The `RabbitMQPublisher` class handles the connection to RabbitMQ and the publishing of messages to the queue.


### 3. Graceful Shutdown

The module listens for `SIGTERM` and `SIGINT` signals to stop the cron job and close the RabbitMQ connection gracefully.


## Dependencies

- **`amqplib`**: A RabbitMQ client for Node.js, used to connect to RabbitMQ and manage queues.
- **`node-cron`**: A cron job scheduler for Node.js, used to schedule recurring tasks.
- **`@nestjs/common`**: Provides the `Logger` class from NestJS for logging messages.


## Conclusion

The `rabbitmq-publisher` module is a crucial part of the application that ensures Ethereum gas price data is regularly updated by triggering events through RabbitMQ. It runs a cron job that publishes messages to a RabbitMQ queue, which the `CronJobModule` listens to and responds by fetching the latest gas prices. This module is essential for applications that require real-time gas price data for their operations.
