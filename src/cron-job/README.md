# CronJobModule

The `CronJobModule` is a key part of the application responsible for keeping the Ethereum gas price data up-to-date. This module listens for events from RabbitMQ, specifically gas price update events, and then fetches the latest gas price from the Ethereum network. The updated gas price is cached for quick access by other parts of the application.

## Features

- **Reactive Gas Price Updates**: Listens for gas price update events via RabbitMQ and fetches the latest gas price when an event is received.
- **RabbitMQ Integration**: Connects to a RabbitMQ server to consume messages from a specific queue.
- **Caching**: Utilizes Redis (via the `DataCacheService`) to cache the latest gas prices, ensuring fast access and reducing the need for frequent network calls to the Ethereum provider.
- **Error Handling and Logging**: Provides robust error handling and detailed logging for easy troubleshooting and monitoring.

## Components

### 1. `CronJobService`

The `CronJobService` is the central service that handles RabbitMQ events for gas price updates.

- **Ethereum Provider**: Uses `ethers.JsonRpcProvider` to connect to the Ethereum network via the Alchemy API.
- **RabbitMQ Consumer**: Listens for the `GAS_PRICE_UPDATE` event via RabbitMQ to trigger the fetching and caching of the latest gas price.
- **Caching**: The gas price is cached using the `DataCacheService` with a time-to-live (TTL) of 60 seconds to ensure up-to-date information is readily available.

#### Methods

- **onModuleInit()**: This method is automatically called when the module is initialized. It sets up the RabbitMQ consumer to listen for gas price update events.
- **fetchGasPrice()**: Fetches the latest gas price from the Ethereum network, formats it to Gwei, logs it, and caches it with a TTL of 60 seconds when triggered by a RabbitMQ event.

### 2. `RabbitMQConsumer`

This class is responsible for managing the connection to a RabbitMQ server and consuming messages from a specific queue.

- **connect()**: Establishes a connection to the RabbitMQ server and creates a communication channel.
- **consume(queue, onMessage)**: Consumes messages from a specified queue and triggers a callback function to process the messages.
- **close()**: Closes the channel and connection to the RabbitMQ server.

### 3. `DataCacheService`

This service, provided by the `SharedModule`, is used to cache the gas price data in Redis. It abstracts the underlying Redis operations, providing a simple interface to get and set cached values.


### Usage

Once the module is set up, it automatically starts listening for gas price update events via RabbitMQ when the application starts. When a gas price update event is received, the `CronJobService` fetches the latest gas price and updates the cache. Other parts of the application can then access the most current gas price data via the `DataCacheService`.

### Error Handling and Logging

The `CronJobService` logs all significant actions, such as successfully fetching and updating the gas price. If an error occurs during this process, it logs the error message to assist with debugging. The service ensures that any issues with RabbitMQ or the Ethereum provider are handled gracefully.

## Conclusion

The `CronJobModule` ensures that the application has access to the most current Ethereum gas prices by reacting to RabbitMQ events and updating the cache accordingly. This module is vital for any application that relies on real-time gas price data for its operations.