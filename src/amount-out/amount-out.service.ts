import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ethers } from 'ethers';
import { AmountOutDto } from './amount-out.dto';
import { PATHS } from "../../config/constants";

// UniswapV2 factory and pair ABI
const UNISWAP_V2_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const UNISWAP_V2_FACTORY_ABI = [
  {
    constant: true,
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
    ],
    name: 'getPair',
    outputs: [{ name: 'pair', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];
const UNISWAP_V2_PAIR_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'getReserves',
    outputs: [
      { internalType: 'uint112', name: '_reserve0', type: 'uint112' },
      { internalType: 'uint112', name: '_reserve1', type: 'uint112' },
      { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

const UNISWAP_V2_ROUTER02_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const UNISWAP_V2_ROUTER02_ABI = [
  {
    constant: true,
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'reserveIn', type: 'uint256' },
      { name: 'reserveOut', type: 'uint256' },
    ],
    name: 'getAmountOut',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];



// Initialize ethers provider
const provider = new ethers.JsonRpcProvider(PATHS.ALCHEMY_API);


@Injectable()
export class AmountOutService {
  async getAmountOut(fromTokenAddress: string, toTokenAddress: string, amountIn: number): Promise<AmountOutDto> {
    try {
      const [reserve0, reserve1] = await this.getReserves(fromTokenAddress, toTokenAddress);
  
      // Convert amountIn from token units to Wei (assuming WETH which has 18 decimals)
      const amountInWei = ethers.parseUnits(amountIn.toString(), 18);
  
      const amountOut = this.calculateAmountOut(amountInWei, BigInt(reserve1), BigInt(reserve0));
  
      console.log('Calculation:', {
        amountIn: amountInWei,
        reserve0,
        reserve1,
        amountOut,
      });
  
  
      const routerContract = new ethers.Contract(UNISWAP_V2_ROUTER02_ADDRESS, UNISWAP_V2_ROUTER02_ABI, provider);
      const verifiedAmountsOut = await routerContract.getAmountsOut(
        amountInWei,
        [fromTokenAddress, toTokenAddress]
      );

      console.log('Verified Amountss Out FULL:');
      console.log(verifiedAmountsOut) // Debug: print verification

      const verifiedAmountOut_1 = verifiedAmountsOut[1];
      console.log('Verified Amountss Out:', verifiedAmountOut_1); // Debug: print verification



      const verifiedAmountOut_2 = await routerContract.getAmountOut(
        amountInWei,
        reserve1,
        reserve0
      );

      console.log('Verified Amountss Out FULL 2:');
      console.log(verifiedAmountOut_2) // Debug: print verification

      // const verifiedAmountOut = verifiedAmountsOut[1];
      // console.log('Verified Amountss Out 2:', verifiedAmountOut); // Debug: print verification
  
  
      return {
        fromTokenAddress,
        toTokenAddress,
        amountIn, // keep this as the original input
        amountOut: amountOut.toString(),
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getReserves(fromTokenAddress: string, toTokenAddress: string): Promise<[number, number]> {
    const factoryContract = new ethers.Contract(UNISWAP_V2_FACTORY_ADDRESS, UNISWAP_V2_FACTORY_ABI, provider);
    const pairAddress = await factoryContract.getPair(fromTokenAddress, toTokenAddress);
    
    // if (pairAddress === ethers.constants.AddressZero) {
    //   throw new Error('Pair not found');
    // }

    const pairContract = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);
    const reserves = await pairContract.getReserves();

    return [reserves._reserve0, reserves._reserve1];
  }


  calculateAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
    if (amountIn <= 0n) {
      throw new Error('INSUFFICIENT_INPUT_AMOUNT');
    }
    if (reserveIn <= 0n || reserveOut <= 0n) {
      throw new Error('INSUFFICIENT_LIQUIDITY');
    }
  
    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
  
    return numerator / denominator;
  }
  
}
