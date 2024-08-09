import { ethers } from 'ethers';
import { ERROR_MESSAGES, UNISWAP } from "../../../config/constants";
import { TokenHandlerErrorData } from './error-handler';

export class TokenCalculationService {
    sortTokens(tokenA: string, tokenB: string): [string, string] {
      return tokenA.toLowerCase() < tokenB.toLowerCase()
        ? [tokenA, tokenB]
        : [tokenB, tokenA];
    }
    
    calculateAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
        try {   
            if (reserveIn <= 0n || reserveOut <= 0n) {
                throw new TokenHandlerErrorData(ERROR_MESSAGES.INSUFFICIENT_PAIR_LIQUIDITY);
            }

            const amountInWithFee = amountIn * 997n;
            const numerator = amountInWithFee * reserveOut;
            const denominator = reserveIn * 1000n + amountInWithFee;

            return numerator / denominator;
        } catch (error) {
            throw new Error(`${ERROR_MESSAGES.CALCULATE_AMOUNT_OUT_ERROR} ${error.message}`);
        }
    }
  
    calculatePairAddress(tokenA: string, tokenB: string): string {
        try{   
            const [token0, token1] = this.sortTokens(tokenA, tokenB);
            const salt = ethers.solidityPackedKeccak256(['address', 'address'], [token0, token1]);
            const addressBytes = ethers.solidityPacked(
                ['bytes1', 'address', 'bytes32', 'bytes32'],
                ['0xff', UNISWAP.UNISWAP_V2_FACTORY_ADDRESS, salt, UNISWAP.UNISWAP_V2_FACTORY_INIT_CODE_HASH]
            );
        
            return ethers.getAddress(`0x${ethers.keccak256(addressBytes).slice(-40)}`);
        } catch (error) {
            throw new Error(`${ERROR_MESSAGES.CALCULATE_PAIR_ADDRESS_ERROR} ${tokenA}/${tokenB}: ${error.message}`);
        }
    }
  }
  