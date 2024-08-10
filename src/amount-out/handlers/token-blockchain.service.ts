import { ethers } from 'ethers';
import { PATHS, UNISWAP, ERROR_MESSAGES } from "../../../config/constants";
import { TokenHandlerErrorData } from '../../shared/services/error-handler.service';

// Initialize the ethers provider using the configured Alchemy API
const provider = new ethers.JsonRpcProvider(PATHS.ALCHEMY_API);

/**
 * TokenBlockchainService handles blockchain-related operations such as
 * retrieving token decimals and fetching token reserves from Uniswap.
 */
export class TokenBlockchainService {

  /**
   * Sorts two token addresses in ascending order.
   * This is often required for interacting with Uniswap pairs,
   * which expect tokens to be passed in a specific order.
   * 
   * @param {string} tokenA - The address of the first token.
   * @param {string} tokenB - The address of the second token.
   * @returns {[string, string]} - A tuple containing the sorted token addresses.
   */
  sortTokens(tokenA: string, tokenB: string): [string, string] {
    return tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA];
  }

  /**
   * Retrieves the number of decimals used by a given token.
   * This is essential for converting between token amounts and their on-chain representation.
   * 
   * @param {string} tokenAddress - The Ethereum address of the token.
   * @returns {Promise<number>} - The number of decimals the token uses.
   * @throws {TokenHandlerErrorData} - Throws an error if the token's decimals cannot be fetched.
   */
  async getTokenDecimals(tokenAddress: string): Promise<number> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function decimals() view returns (uint8)'],
        provider
      );
      return await tokenContract.decimals();
    } catch (error) {
      // If fetching the token's decimals fails, throw a custom error
      throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_TOKEN_DETAILS_ERROR} ${tokenAddress}`);
    }
  }

  /**
   * Fetches the reserve amounts for a token pair from Uniswap.
   * Reserves are essential for calculating the price impact and slippage for token swaps.
   * 
   * @param {string} fromTokenAddress - The address of the token being swapped from.
   * @param {string} toTokenAddress - The address of the token being swapped to.
   * @param {string} pairAddress - The Uniswap pair address that contains the reserves.
   * @returns {Promise<[bigint, bigint]>} - A tuple containing the reserves for the token pair.
   * @throws {TokenHandlerErrorData} - Throws an error if the reserves cannot be fetched.
   */
  async getReserves(fromTokenAddress: string, toTokenAddress: string, pairAddress: string): Promise<[bigint, bigint]> {
    try {
      // Create a contract instance for the Uniswap pair
      const pairContract = new ethers.Contract(pairAddress, UNISWAP.UNISWAP_V2_PAIR_ABI, provider);
      // Fetch the reserves from the pair contract
      const reserves = await pairContract.getReserves();

      // Sort the token addresses to determine which reserve corresponds to which token
      const [token0, token1] = this.sortTokens(fromTokenAddress, toTokenAddress);

      // Return the reserves in the correct order
      if (fromTokenAddress.toLowerCase() === token0.toLowerCase()) {
        return [BigInt(reserves._reserve0), BigInt(reserves._reserve1)];
      } else {
        return [BigInt(reserves._reserve1), BigInt(reserves._reserve0)];
      }
    } catch (error) {
      // If fetching the reserves fails, throw a custom error
      throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_RESERVES_DETAILS_ERROR} ${fromTokenAddress}/${toTokenAddress}`);
    }
  }
}
