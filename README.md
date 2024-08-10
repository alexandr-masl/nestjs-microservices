# Trading Microservices

## Overview

This application is designed to provide real-time Ethereum gas price monitoring and facilitate token swap calculations using cached data for faster responses. The application is built with NestJS and incorporates several key modules to handle different responsibilities. It leverages RabbitMQ for message-driven events, cron jobs for scheduled tasks, and Redis for caching data to ensure optimal performance.

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

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Configure the environment variables:

   Create a `.env` file in the root directory and add the necessary environment variables, such as the Redis connection details, RabbitMQ URL, and Alchemy API key.

4. Start the application:

   ```bash
   npm run start
   ```

5. Start the Cron-Publisher:

   ```bash
   npm run publisher
   ```

## Usage

### API Endpoints

- **Get Gas Price**: `GET /gas-price`
  - Retrieves the latest cached Ethereum gas price.
- **Calculate Token Swap Output**: `GET /amount-out/:fromTokenAddress/:toTokenAddress/:amountIn`
  - Returns the expected output amount for a given token swap.


## Conclusion

This application provides a robust and efficient way to monitor Ethereum gas prices and calculate token swaps using Uniswap. By leveraging RabbitMQ for event-driven updates, cron jobs for scheduling tasks, and Redis for caching, it ensures that data is always up-to-date and that responses are delivered quickly. The modular design allows for easy extension and scalability, making it suitable for a variety of blockchain-related applications.
