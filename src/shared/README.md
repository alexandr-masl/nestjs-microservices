# SharedModule

The `SharedModule` is a core module in the NestJS application that provides commonly used services and utilities across different modules in the project. This module is designed to encapsulate reusable logic, such as caching and custom error handling, making it easily accessible to other modules by simply importing the `SharedModule`.

## Features

- **Data Caching with Redis**: The `SharedModule` includes the `DataCacheService`, a service that interacts with a Redis cache to store and retrieve data efficiently. This service abstracts the Redis operations, allowing other modules to use caching without directly managing Redis connections or operations.
  
- **Custom Error Handling**: The module also provides custom error classes (`TokenHandlerError`, `TokenHandlerErrorData`) that extend the standard JavaScript `Error` class. These custom error classes are used for handling specific errors in a more descriptive and consistent manner across the application.

## Services Provided

### 1. `DataCacheService`

This service is responsible for caching operations using Redis. It provides two main methods:

- **`getCacheValue(key: string): Promise<string | null>`**: Retrieves a cached value for a given key from Redis. Returns the value as a string or `null` if the key does not exist.

- **`setCacheValue(key: string, value: string, ttl: number): Promise<void>`**: Sets a value in the cache with a specified time-to-live (TTL). The value is stored under the provided key, and it expires after the TTL (in seconds).

### 2. `TokenHandlerError`

A custom error class used for general errors related to the `TokenHandler`. It extends the base `Error` class and provides a consistent error structure for the application.

### 3. `TokenHandlerErrorData`

A specialized error class that extends `TokenHandlerError`. It is intended for data-related errors within the `TokenHandler`, providing more context-specific error messages.
