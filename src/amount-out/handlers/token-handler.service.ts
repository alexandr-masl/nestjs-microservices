import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ERROR_MESSAGES } from "../../../config/constants";
import { TokenHandlerErrorData } from './error-handler';
import { TokenBlockchainService } from './token-blockchain.service';
import { TokenCalculationService } from './token-calculation.service';
import { DataCacheService } from '../../shared/services/data-cache.service';

/**
 * TokenHandler is responsible for managing and orchestrating operations
 * related to token information retrieval, caching, and Uniswap-based calculations.
 * This includes fetching token decimals, calculating pair addresses, and determining
 * the output amount for token swaps.
 */
@Injectable()
export class TokenHandler {

  constructor(
    private readonly dataCacheService: DataCacheService,
    private readonly blockchainService: TokenBlockchainService,
    private readonly calculationService: TokenCalculationService,
  ) {}

  /**
   * Retrieves the decimals for a given token, with caching to optimize performance.
   * 
   * @param {string} tokenAddress - The address of the token.
   * @returns {Promise<number>} - The number of decimals the token uses.
   * @throws {TokenHandlerErrorData} - Throws an error if token details cannot be fetched.
   */
  private async getTokenDecimals(tokenAddress: string): Promise<number> {
    const cacheKey = `tokenDecimals:${tokenAddress}`;
    
    try {
      // Check the cache first
      let decimals = Number(await this.dataCacheService.getCacheValue(cacheKey));
      if (decimals) {
        return decimals;
      }

      // If not in cache, fetch from blockchain
      decimals = await this.blockchainService.getTokenDecimals(tokenAddress);

      // Cache the result for future requests
      await this.dataCacheService.setCacheValue(cacheKey, decimals.toString(), 86400);

      return decimals;
    } catch (error) {
      throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_TOKEN_DETAILS_ERROR} ${tokenAddress}`);
    }
  }

  /**
   * Retrieves or calculates the pair address for a given token pair, utilizing caching.
   * 
   * @param {string} tokenA - The address of the first token.
   * @param {string} tokenB - The address of the second token.
   * @returns {Promise<string>} - The address of the pair.
   */
  async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
    const cacheKey = `pairAddress:${tokenA}:${tokenB}`;
    
    // Attempt to retrieve the pair address from cache
    let pairAddress = await this.dataCacheService.getCacheValue(cacheKey);
    if (pairAddress) {
      return pairAddress;
    }

    // If not cached, calculate the pair address
    pairAddress = this.calculationService.calculatePairAddress(tokenA, tokenB);

    // Cache the calculated pair address for future use
    await this.dataCacheService.setCacheValue(cacheKey, pairAddress, 86400);

    return pairAddress;
  }

  /**
   * Calculates the output amount for a given token swap, based on the input amount,
   * utilizing reserves from Uniswap.
   * 
   * @param {string} fromTokenAddress - The address of the input token.
   * @param {string} toTokenAddress - The address of the output token.
   * @param {number} amountIn - The amount of the input token.
   * @returns {Promise<string>} - The output amount formatted in human-readable units.
   */
  async getAmountOut(fromTokenAddress: string, toTokenAddress: string, amountIn: number): Promise<string> {
    // Get the pair address for the token swap
    const pairAddress = await this.getPairAddress(fromTokenAddress, toTokenAddress);

    // Get the reserves for the token pair
    const [reserveIn, reserveOut] = await this.blockchainService.getReserves(fromTokenAddress, toTokenAddress, pairAddress);

    // Get the number of decimals for both the input and output tokens
    const fromTokenDecimals = await this.getTokenDecimals(fromTokenAddress);
    const toTokenDecimals = await this.getTokenDecimals(toTokenAddress);

    // Convert the input amount to Wei (or the smallest unit of the token)
    const amountInWei = ethers.parseUnits(amountIn.toString(), fromTokenDecimals);

    // Calculate the output amount using the Uniswap formula
    const amountOut = this.calculationService.calculateAmountOut(amountInWei, reserveIn, reserveOut);

    // Format the output amount to human-readable units
    return ethers.formatUnits(amountOut, Number(toTokenDecimals));
  }
}
