# AmountOutModule

The `AmountOutModule` provides the necessary services and controllers to calculate the expected output amount when swapping tokens on decentralized exchanges like Uniswap. This module integrates blockchain interactions, caching mechanisms, and token calculations to deliver accurate and efficient results.

## Features

- **Token Swap Calculations**: The `AmountOutModule` computes the output amount for a given token swap using real-time blockchain data.
  
- **Caching with Redis**: It leverages Redis to cache frequently accessed data, such as token decimals and Uniswap pair addresses, enhancing performance by reducing unnecessary blockchain calls.

- **Custom Error Handling**: The module uses custom error classes to handle and report errors specific to token swaps, ensuring clear and consistent error messaging.

## Components

### 1. `AmountOutController`

The `AmountOutController` exposes the endpoint to compute the amount of tokens received after a swap.

- **Endpoint**: `GET /amount-out/:fromTokenAddress/:toTokenAddress/:amountIn`
- **Parameters**:
  - `fromTokenAddress`: Ethereum address of the token being swapped from.
  - `toTokenAddress`: Ethereum address of the token being swapped to.
  - `amountIn`: The amount of the input token.
- **Response**: Returns an `AmountOutDto` containing the swap details, including the output amount.

### 2. `AmountOutService`

The `AmountOutService` handles the core logic for calculating the output amount. It interacts with the `TokenHandler` to perform the necessary calculations and manages error handling.

- **Method**: `getAmountOut(fromTokenAddress: string, toTokenAddress: string, amountIn: number): Promise<AmountOutDto>`
- **Functionality**:
  - Uses the `TokenHandler` to fetch reserves, decimals, and calculate the output amount.
  - Handles and logs any errors that occur during the process.

### 3. `TokenHandler`

The `TokenHandler` orchestrates the interactions between different services to retrieve token data, calculate amounts, and cache results.

- **Methods**:
  - `getTokenDecimals(tokenAddress: string): Promise<number>`: Retrieves token decimals, with caching.
  - `getPairAddress(tokenA: string, tokenB: string): Promise<string>`: Calculates and caches the Uniswap pair address for two tokens.
  - `getAmountOut(fromTokenAddress: string, toTokenAddress: string, amountIn: number): Promise<string>`: Calculates the output amount for a token swap.

### 4. `TokenBlockchainService`

Handles direct interactions with the blockchain, such as fetching token decimals and reserves from Uniswap.

- **Methods**:
  - `getTokenDecimals(tokenAddress: string): Promise<number>`
  - `getReserves(fromTokenAddress: string, toTokenAddress: string, pairAddress: string): Promise<[bigint, bigint]>`

### 5. `TokenCalculationService`

Provides utility functions for calculating Uniswap-specific data, such as output amounts and pair addresses.

- **Methods**:
  - `calculateAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint`
  - `calculatePairAddress(tokenA: string, tokenB: string): string`
