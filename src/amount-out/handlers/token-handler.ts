import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ethers } from 'ethers';
import { ERROR_MESSAGES, PATHS, UNISWAP } from "../../../config/constants";
import { TokenHandlerErrorData } from './error-handler';
import { TokenCacheService } from './token-cache.service';
import { TokenBlockchainService } from './token-blockchain';
import { TokenCalculationService } from './token-calculation.service';

// const provider = new ethers.JsonRpcProvider(PATHS.ALCHEMY_API);

export class TokenHandler {

  private readonly cacheService: TokenCacheService;
  private readonly blockchainService: TokenBlockchainService;
  private readonly calculationService: TokenCalculationService;

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
  ) {
    this.calculationService = new TokenCalculationService;
    this.cacheService = new TokenCacheService(redisClient);
    this.blockchainService = new TokenBlockchainService(this.calculationService);
  }

  private async getTokenDecimals(tokenAddress: string): Promise<number> {
    const cacheKey = `tokenDecimals:${tokenAddress}`;
    
    try {
      let decimals = Number(await this.cacheService.getCacheValue(cacheKey));
      if (decimals) {
        return decimals;
      }
      decimals = await this.blockchainService.getTokenDecimals(tokenAddress);
      await this.cacheService.setCacheValue(cacheKey, decimals.toString(), 86400);
      return decimals;

      // // Check if the value is in the cache
      // let decimals = await this.redisClient.get(cacheKey);
      
      // if (decimals) {
      //   return Number(decimals); // Return cached value
      // }

      // // Fetch from the blockchain if not in cache
      // const tokenContract = new ethers.Contract(
      //   tokenAddress,
      //   ['function decimals() view returns (uint8)'],
      //   provider
      // );
      // decimals = await tokenContract.decimals();

      // // Cache the value
      // await this.redisClient.set(cacheKey, decimals, 'EX', 86400); // Cache for 1 hour

      // return Number(decimals);
    } catch (error) {
      throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_TOKEN_DETAILS_ERROR} ${tokenAddress}`);
    }
  }

  async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
    const cacheKey = `pairAddress:${tokenA}:${tokenB}`;
    let pairAddress = await this.cacheService.getCacheValue(cacheKey);
    if (pairAddress) {
      return pairAddress;
    }
    pairAddress = this.calculationService.calculatePairAddress(tokenA, tokenB);
    await this.cacheService.setCacheValue(cacheKey, pairAddress, 86400);
    return pairAddress;
  }

  // private async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
  //   const cacheKey = `pairAddress:${tokenA}:${tokenB}`;
    
  //   try {
  //     // Check if the value is in the cache
  //     let pairAddress = await this.redisClient.get(cacheKey);
      
  //     if (pairAddress) {
  //       return pairAddress; // Return cached value
  //     }

  //     // Calculate the pair address if not in cache
  //     const [token0, token1] = this.sortTokens(tokenA, tokenB);
  //     const salt = ethers.solidityPackedKeccak256(['address', 'address'], [token0, token1]);
  //     const addressBytes = ethers.solidityPacked(
  //       ['bytes1', 'address', 'bytes32', 'bytes32'],
  //       ['0xff', UNISWAP.UNISWAP_V2_FACTORY_ADDRESS, salt, UNISWAP.UNISWAP_V2_FACTORY_INIT_CODE_HASH]
  //     );

  //     pairAddress = ethers.getAddress(`0x${ethers.keccak256(addressBytes).slice(-40)}`);

  //     // Cache the value
  //     await this.redisClient.set(cacheKey, pairAddress, 'EX', 86400); // Cache for 24 hours

  //     return pairAddress;
  //   } catch (error) {
  //     throw new Error(`${ERROR_MESSAGES.CALCULATE_PAIR_ADDRESS_ERROR} ${tokenA}/${tokenB}: ${error.message}`);
  //   }
  // }

  // private async getReserves(fromTokenAddress: string, toTokenAddress: string): Promise<[bigint, bigint]> {
  //   try {
  //     const pairAddress = await this.getPairAddress(fromTokenAddress, toTokenAddress);
  //     const pairContract = new ethers.Contract(pairAddress, UNISWAP.UNISWAP_V2_PAIR_ABI, provider);
  //     const reserves = await pairContract.getReserves();

  //     const [token0, token1] = this.sortTokens(fromTokenAddress, toTokenAddress);

  //     if (fromTokenAddress.toLowerCase() === token0.toLowerCase()) {
  //       return [BigInt(reserves._reserve0), BigInt(reserves._reserve1)];
  //     } else {
  //       return [BigInt(reserves._reserve1), BigInt(reserves._reserve0)];
  //     }
  //   } catch (error) {
  //     throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_RESERVES_DETAILS_ERROR} ${fromTokenAddress}/${toTokenAddress}`);
  //   }
  // }

  // private sortTokens(tokenA: string, tokenB: string): [string, string] {
  //   return tokenA.toLowerCase() < tokenB.toLowerCase()
  //     ? [tokenA, tokenB]
  //     : [tokenB, tokenA];
  // }

  // private calculateAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  //   try {   
  //     if (reserveIn <= 0n || reserveOut <= 0n) {
  //       throw new TokenHandlerErrorData(ERROR_MESSAGES.INSUFFICIENT_PAIR_LIQUIDITY);
  //     }

  //     const amountInWithFee = amountIn * 997n;
  //     const numerator = amountInWithFee * reserveOut;
  //     const denominator = reserveIn * 1000n + amountInWithFee;

  //     return numerator / denominator;
  //   } catch (error) {
  //     throw new Error(`${ERROR_MESSAGES.CALCULATE_AMOUNT_OUT_ERROR} ${error.message}`);
  //   }
  // }

  async getAmountOut(fromTokenAddress: string, toTokenAddress: string, amountIn: number): Promise<string> {
    const pairAddress = await this.getPairAddress(fromTokenAddress, toTokenAddress);
    const [reserveIn, reserveOut] = await this.blockchainService.getReserves(fromTokenAddress, toTokenAddress, pairAddress);
    const fromTokenDecimals = await this.getTokenDecimals(fromTokenAddress);
    const toTokenDecimals = await this.getTokenDecimals(toTokenAddress);
    const amountInWei = ethers.parseUnits(amountIn.toString(), fromTokenDecimals);
    const amountOut = this.calculationService.calculateAmountOut(amountInWei, reserveIn, reserveOut);

    return ethers.formatUnits(amountOut, Number(toTokenDecimals));
  }
}
