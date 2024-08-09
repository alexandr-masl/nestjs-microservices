import { ethers } from 'ethers';
import { PATHS, UNISWAP, ERROR_MESSAGES } from "../../../config/constants";
import { TokenHandlerErrorData } from './error-handler';
import { TokenCalculationService } from './token-calculation.service';

const provider = new ethers.JsonRpcProvider(PATHS.ALCHEMY_API);

export class TokenBlockchainService {
  private readonly calculationService: TokenCalculationService;

  constructor(calculationService: TokenCalculationService){
    this.calculationService = calculationService;
  }
  
  async getTokenDecimals(tokenAddress: string): Promise<number> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function decimals() view returns (uint8)'],
        provider
      );
      return await tokenContract.decimals();
    } catch (error) {
      throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_TOKEN_DETAILS_ERROR} ${tokenAddress}`);
    }
  }

  // async getReserves(pairAddress: string): Promise<[bigint, bigint]> {
  //   try {
  //     const pairContract = new ethers.Contract(pairAddress, UNISWAP.UNISWAP_V2_PAIR_ABI, provider);
  //     const reserves = await pairContract.getReserves();
  //     return [BigInt(reserves._reserve0), BigInt(reserves._reserve1)];
  //   } catch (error) {
  //     throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_RESERVES_DETAILS_ERROR} ${pairAddress}`);
  //   }
  // }

  async getReserves(fromTokenAddress: string, toTokenAddress: string, pairAddress: string): Promise<[bigint, bigint]> {
    try {

      const pairContract = new ethers.Contract(pairAddress, UNISWAP.UNISWAP_V2_PAIR_ABI, provider);
      const reserves = await pairContract.getReserves();

      const [token0, token1] = this.calculationService.sortTokens(fromTokenAddress, toTokenAddress);

      if (fromTokenAddress.toLowerCase() === token0.toLowerCase()) {
        return [BigInt(reserves._reserve0), BigInt(reserves._reserve1)];
      } else {
        return [BigInt(reserves._reserve1), BigInt(reserves._reserve0)];
      }
    } catch (error) {
      throw new TokenHandlerErrorData(`${ERROR_MESSAGES.FETCH_RESERVES_DETAILS_ERROR} ${fromTokenAddress}/${toTokenAddress}`);
    }
  }
}
