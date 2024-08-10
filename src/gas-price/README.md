# Gas Price Module

## Overview

The `Gas Price Module` is a component of the project that provides functionalities for retrieving, caching, and serving the current Ethereum gas price. It exposes a REST API endpoint for clients to query the latest gas price, ensuring that the information is always up-to-date and efficiently accessible. This module uses Redis for caching, ensuring fast retrieval of frequently requested data.

## Features

- **REST API Endpoint:** A single endpoint `/gas-price` to fetch the current gas price.
- **Caching:** Utilizes Redis for caching gas price data, reducing the load on external services and improving response times.
- **Error Handling:** Implements robust error handling mechanisms to manage and log potential issues, ensuring high availability and reliability.
- **Swagger Integration:** Fully documented API endpoint using Swagger, making it easy for developers to understand and interact with the API.

## Components

### 1. **GasPriceController**
   - **Path:** `src/gas-price/gas-price.controller.ts`
   - **Responsibility:** Exposes the `/gas-price` endpoint for retrieving the current gas price.
   - **Annotations:**
     - **`@Get()`**: Defines the HTTP GET method for the endpoint.
     - **`@ApiOperation`**: Provides a summary of the endpoint for Swagger documentation.
     - **`@ApiResponse`**: Describes the expected responses, including successful and error responses.

### 2. **GasPriceService**
   - **Path:** `src/gas-price/gas-price.service.ts`
   - **Responsibility:** Handles the business logic of retrieving the gas price from the cache, and gracefully handles any errors.
   - **Methods:**
     - **`getCachedGasPrice`**: Retrieves the gas price from Redis. If the value is not found or an error occurs, it throws appropriate exceptions.

### 3. **GasPriceDto**
   - **Path:** `src/gas-price/gas-price.dto.ts`
   - **Responsibility:** Data Transfer Object (DTO) that defines the structure of the response returned by the controller.
   - **Properties:**
     - **`gasPrice`**: A string representing the current gas price.

### 4. **GasPriceModule**
   - **Path:** `src/gas-price/gas-price.module.ts`
   - **Responsibility:** Defines the module, imports necessary shared services, and provides the controller and service.

### 5. **SharedModule**
   - **Path:** `src/shared/shared.module.ts`
   - **Responsibility:** Provides shared services (e.g., `DataCacheService`) that are used across multiple modules, including the `Gas Price Module`.

## How It Works

1. **Request Flow:**
   - When a client makes a `GET` request to `/gas-price`, the `GasPriceController` handles the request and delegates the task to `GasPriceService`.
   - The `GasPriceService` interacts with `DataCacheService` to fetch the gas price from Redis. If the value is found, it is returned to the client. If not, an appropriate error is raised.

2. **Caching:**
   - Gas prices are cached in Redis to avoid excessive querying of external services. The `DataCacheService` handles the interaction with Redis, including getting and setting cache values.

3. **Error Handling:**
   - The module includes comprehensive error handling to manage scenarios where the gas price is not available in the cache or unexpected issues arise during the data retrieval process.
   - Errors are logged for further analysis, and user-friendly error messages are returned to the client.
