import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ERROR_MESSAGES } from "../../../config/constants";
import { TokenHandlerErrorData } from './error-handler';
import { TokenBlockchainService } from './token-blockchain.service';
import { TokenCalculationService } from './token-calculation.service';
import { DataCacheService } from 'src/shared/services/data-cache.service';

@Injectable()
export class TokenHandler {

  constructor(
    private readonly dataCacheService: DataCacheService,
    private readonly blockchainService: TokenBlockchainService,
    private readonly calculationService: TokenCalculationService,
  ) {}


  private async getTokenDecimals(tokenAddress: string): Promise<number> {
    const cacheKey = `tokenDecimals:${tokenAddress}`;
    
    try {
      let decimals = Number(await this.dataCacheService.getCacheValue(cacheKey));
      if (decimals) {
        return decimals;
      }
      decimals = await this.blockchainService.getTokenDecimals(tokenAddress);
      await this.dataCacheService.setCacheValue(cacheKey, decimals.toString(), 86400);
      return decimals;

    } catch (error) {
      throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_TOKEN_DETAILS_ERROR} ${tokenAddress}`);
    }
  }

  async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
    const cacheKey = `pairAddress:${tokenA}:${tokenB}`;
    let pairAddress = await this.dataCacheService.getCacheValue(cacheKey);
    if (pairAddress) {
      return pairAddress;
    }
    pairAddress = this.calculationService.calculatePairAddress(tokenA, tokenB);
    await this.dataCacheService.setCacheValue(cacheKey, pairAddress, 86400);
    return pairAddress;
  }

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
