# Trading Microservices

## Overview

This application is designed to provide real-time Ethereum gas price monitoring and facilitate token swap calculations using cached data for faster responses. The application is built with NestJS and incorporates several key modules to handle different responsibilities. It leverages RabbitMQ for message-driven events, cron jobs for scheduled tasks, and Redis for caching data to ensure optimal performance.


## Scalability and Orchestration

Given that the application uses RabbitMQ for message-driven communication, it is designed to scale horizontally by launching multiple instances of the application. RabbitMQ will distribute events across these instances, allowing the system to handle increased loads efficiently.

For production environments, this application is intended to be orchestrated using Kubernetes, which will manage the deployment, scaling, and monitoring of the application instances. Nginx may also be used as a reverse proxy and load balancer to distribute incoming traffic across multiple instances, ensuring high availability and reliability.

While Docker, Docker Compose and Nginx configurations are provided within the project for local development and testing purposes, the full setup, including Kubernetes and Nginx configurations, should be tailored and implemented on the production server. These production-specific configurations are not fully described in this document, as they depend on the specific requirements and infrastructure of the deployment environment.


## Table of Contents

- [Overview](#overview)
- [Application Flow](#application-flow)
- [Modules](#modules)
  - [Gas Price Module](#gas-price-module)
  - [Amount-Out Module](#amount-out-module)
  - [Cron Job Module](#cron-job-module)
  - [Shared Module](#shared-module)
- [Key Features](#key-features)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Conclusion](#conclusion)

## Application Flow

1. **Gas Price Update via RabbitMQ and Cron Job:**
   - A cron job runs periodically, publishing a message to a RabbitMQ queue (`gas-price-update`) to signal the application to update the Ethereum gas price.
   - The `CronJobModule` listens for these messages and, upon receiving one, fetches the latest gas price from the Ethereum network.
   - The fetched gas price is then cached in Redis for quick retrieval.

2. **Token Swap Calculation:**
   - Users can request the expected output of a token swap through the `AmountOutModule`.
   - The `AmountOutService` calculates the output by retrieving the required token pair reserves from Uniswap, performing necessary calculations, and using cached data (like token decimals and pair addresses) to optimize the process.
   - The calculated result is then returned to the user.

3. **Caching for Performance:**
   - All critical data, including gas prices, token decimals, and pair addresses, are cached using Redis. This reduces the need to repeatedly fetch data from the blockchain, significantly improving the application's response time.

## Modules

### Gas Price Module

- **Purpose**: Manages the retrieval and caching of Ethereum gas prices.
- **Key Components**:
  - **`GasPriceService`**: Fetches the latest gas price from the Ethereum network and caches it in Redis.
  - **`GasPriceController`**: Exposes an API endpoint to retrieve the cached gas price.
  - **`GasPriceDto`**: Data Transfer Object representing the structure of the gas price response.

### Amount-Out Module

- **Purpose**: Calculates the expected output amount when swapping tokens on Uniswap.
- **Key Components**:
  - **`AmountOutService`**: Handles the logic for calculating the output amount of a token swap.
  - **`TokenHandler`**: Orchestrates the retrieval of token-related data and calculations, leveraging caching and blockchain services.
  - **`AmountOutController`**: Exposes an API endpoint for users to request token swap calculations.
  - **`AmountOutDto`**: Data Transfer Object for handling and validating user input for token swap requests.

### Cron Job Module

- **Purpose**: Listens for gas price update events and triggers the fetching of the latest gas price.
- **Key Components**:
  - **`CronJobService`**: Listens to RabbitMQ events and, upon receiving an event, fetches and updates the Ethereum gas price.
  - **`RabbitMQConsumer`**: A utility class for connecting to RabbitMQ and consuming messages from a specific queue.

### Shared Module

- **Purpose**: Provides shared services like caching to be used across the application.
- **Key Components**:
  - **`DataCacheService`**: Manages interaction with Redis for caching data like gas prices, token decimals, and pair addresses.
  - **`TokenHandlerErrorData`**: Custom error handling for token-related operations, ensuring consistency and clarity in error messaging.

## Key Features

- **Real-Time Gas Price Updates**: The application ensures that Ethereum gas prices are updated in real-time by listening to RabbitMQ events triggered by a cron job.
- **Optimized Token Swap Calculations**: Utilizes cached data for token-related operations to provide quick and efficient token swap calculations.
- **Scalable Architecture**: Modular design allows for easy scaling and extension of the application, such as adding new features or supporting additional blockchain networks.
- **Robust Error Handling**: Consistent and clear error handling across the application, ensuring that issues are identified and managed effectively.
- **Comprehensive Caching**: Redis is used extensively to cache critical data, reducing the need for repeated blockchain queries and improving overall performance.

## Setup and Installation

### Prerequisites

- Node.js and npm
- Redis server
- RabbitMQ server
- Alchemy API Key for Ethereum network access


### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/alexandr-masl/nestjs-microservices.git
   cd your-repository
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Configure the environment variables:

   Create a `.env` file in the root directory and add the necessary environment variables, such as the Redis connection details, RabbitMQ URL, and Alchemy API key.

### Running the Application with Docker Compose

To run the entire application stack, including Redis, RabbitMQ, and the NestJS application, using Docker Compose, follow these steps:

4. **Create a Docker Network for the Microservices:**

   ```bash
   docker network create mynetwork
   ```

   This command creates a custom Docker network that allows the different services (Redis, RabbitMQ, and your NestJS app) to communicate with each other.

5. **Launch the Redis and RabbitMQ Services:**

   ```bash
   docker run -d --name rabbitmq-server --network mynetwork -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

   This command launches the RabbitMQ server within the `mynetwork` Docker network. The server will be accessible on port 5672 for messaging and port 15672 for the management UI.

   ```bash
   docker run -d --name redis-server --network mynetwork -p 6379:6379 redis:6-alpine
   ```

   This command launches the Redis server within the `mynetwork` Docker network, available on port 6379.

6. **Start the NestJS Application:**

   From the root directory of your project, run:

   ```bash
   docker-compose up --build
   ```

   This command builds and starts the NestJS application, which will now be running and connected to the Redis and RabbitMQ services.

7. **Start the RabbitMQ Publisher:**

   Navigate to the `rabbitmq-publisher` directory and run:

   ```bash
   cd rabbitmq-publisher
   docker-compose up --build
   ```

   This command builds and starts the RabbitMQ publisher service, which will publish messages to RabbitMQ as scheduled.


### Starting the Application Manually (Without Docker)

If you prefer to run the application manually on your local machine without Docker:

4. **Start the Redis Server:**

   ```bash
   redis-server
   ```

   This command will launch the Redis server locally on port 6379, which is required for caching data in the application.

5. **Start the RabbitMQ Server:**

   ```bash
   rabbitmq-server
   ```

   This command will launch the RabbitMQ server locally on port 5672 (for messaging) and port 15672 (for management UI). The RabbitMQ server is essential for handling the application's message-driven events.

6. **Start the Application:**

   ```bash
   npm run start
   ```

7. **Start the Cron-Publisher:**

   ```bash
   npm run cron-publisher
   ```


### Testing

1. Run unit tests:

   ```bash
   npm run test
   ```

   This command will execute all unit tests in the application using Jest.

2. Run end-to-end (e2e) tests:

   ```bash
   npm run test:e2e
   ```

   This command will execute all end-to-end tests using the Jest configuration located in `./test/jest-e2e.json`.


### Example Usage

To test the `GET /gasPrice` endpoint using Swagger UI:

1. Navigate to the Swagger UI at `http://localhost:3000/api`.
2. Scroll down to the `GasPriceController` section.
3. Click on the `GET /gasPrice` endpoint to expand it.
4. Click the `Try it out` button.
5. Click the `Execute` button.
6. View the response in the `Response` section below.

This allows you to see the gas price fetched by the application.


### API Endpoints

- **Get Gas Price**: `GET /gas-price`
  - Retrieves the latest cached Ethereum gas price.
- **Calculate Token Swap Output**: `GET /amount-out/:fromTokenAddress/:toTokenAddress/:amountIn`
  - Returns the expected output amount for a given token swap.


### .env.example
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
ALCHEMY_API_KEY=your-alchemy-api-key


# Security, Stability, and Performance Features

1. **Rate Limiting**
   - Protects the API from abuse by limiting the number of requests a client can make within a specified time frame.

2. **Cross-Origin Resource Sharing (CORS) Configuration**
   - Restricts which domains can access the API, enhancing security.

3. **Security Best Practices**
   - HTTPS for secure data transmission.
   - Input sanitization to prevent SQL injection, XSS, and other attacks.
   - Environment variables for managing sensitive configuration values.
   - Helmet middleware for securing the app by setting various HTTP headers.

4. **Performance Optimization**
   - Caching to reduce load and improve response times.
   - Designed for load balancing across multiple instances.
   - Optimized database queries for performance.

5. **Logging and Monitoring**
   - Logging of key events and errors for troubleshooting.
   - Monitoring tools recommended for tracking application performance.

6. **Error Handling and Input Validation**
   - Granular error handling, particularly for interactions with external systems like Ethereum contracts.
   - Enforced input validation to ensure data integrity.

7. **API Documentation**
   - Comprehensive API documentation using Swagger.

8. **Graceful Shutdown**
   - Ensures the application shuts down cleanly without data loss.

9. **Port Configuration Best Practices**
   - Port configuration via environment variables.
   - Use of reverse proxy (e.g., Nginx) to manage traffic.
   - Application server runs on an internal network, with only the reverse proxy exposed.

10. **Kubernetes and Nginx for Orchestration**
    - Application is designed to support multiple instances with event distribution via RabbitMQ.
    - Full orchestration and load balancing can be handled by Kubernetes and Nginx in a production environment.



## Conclusion

This application provides a robust and efficient way to monitor Ethereum gas prices and calculate token swaps using Uniswap. By leveraging RabbitMQ for event-driven updates, cron jobs for scheduling tasks, and Redis for caching, it ensures that data is always up-to-date and that responses are delivered quickly. The modular design allows for easy extension and scalability, making it suitable for a variety of blockchain-related applications.
