import { ethers } from 'ethers';
import { ERROR_MESSAGES, UNISWAP } from "../../../config/constants";
import { TokenHandlerErrorData } from '../../shared/services/error-handler.service';

/**
 * TokenCalculationService provides methods for calculating Uniswap-related data,
 * such as the output amount for a swap and the pair address for a token pair.
 */
export class TokenCalculationService {

  /**
   * Sorts two token addresses in ascending order.
   * This is essential for maintaining consistency when interacting with Uniswap pairs,
   * which require the tokens to be sorted in a specific order.
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
   * Calculates the output amount for a given input amount and reserves,
   * following the Uniswap formula for swaps.
   * 
   * @param {bigint} amountIn - The amount of the input token.
   * @param {bigint} reserveIn - The reserve of the input token.
   * @param {bigint} reserveOut - The reserve of the output token.
   * @returns {bigint} - The calculated output amount.
   * @throws {TokenHandlerErrorData} - Throws an error if reserves are insufficient.
   */
  calculateAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
    try {   
      // Ensure there is sufficient liquidity in the pair
      if (reserveIn <= 0n || reserveOut <= 0n) {
        throw new TokenHandlerErrorData(ERROR_MESSAGES.INSUFFICIENT_PAIR_LIQUIDITY);
      }

      // Apply Uniswap's fee and calculate the output amount
      const amountInWithFee = amountIn * 997n;
      const numerator = amountInWithFee * reserveOut;
      const denominator = reserveIn * 1000n + amountInWithFee;

      return numerator / denominator;
    } catch (error) {
      // Rethrow the error with additional context
      throw new Error(`${ERROR_MESSAGES.CALCULATE_AMOUNT_OUT_ERROR} ${error.message}`);
    }
  }

  /**
   * Calculates the pair address for a given token pair, following Uniswap's
   * deterministic pair address generation formula.
   * 
   * @param {string} tokenA - The address of the first token.
   * @param {string} tokenB - The address of the second token.
   * @returns {string} - The calculated pair address.
   * @throws {Error} - Throws an error if the pair address calculation fails.
   */
  calculatePairAddress(tokenA: string, tokenB: string): string {
    try {   
      const [token0, token1] = this.sortTokens(tokenA, tokenB);
      const salt = ethers.solidityPackedKeccak256(['address', 'address'], [token0, token1]);
      const addressBytes = ethers.solidityPacked(
        ['bytes1', 'address', 'bytes32', 'bytes32'],
        ['0xff', UNISWAP.UNISWAP_V2_FACTORY_ADDRESS, salt, UNISWAP.UNISWAP_V2_FACTORY_INIT_CODE_HASH]
      );
      
      return ethers.getAddress(`0x${ethers.keccak256(addressBytes).slice(-40)}`);
    } catch (error) {
      // Rethrow the error with additional context about the tokens involved
      throw new Error(`${ERROR_MESSAGES.CALCULATE_PAIR_ADDRESS_ERROR} ${tokenA}/${tokenB}: ${error.message}`);
    }
  }
}
