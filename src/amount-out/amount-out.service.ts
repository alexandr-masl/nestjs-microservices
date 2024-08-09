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


      const [reserveOut, reserveIn] = await this.getReserves(fromTokenAddress, toTokenAddress);
      
      const reservesHashtable: { [address: string]: bigint } = {};
      reservesHashtable[fromTokenAddress] = BigInt(reserveIn);
      reservesHashtable[toTokenAddress] = BigInt(reserveOut);

      const fromTokenDecimals = await this.getTokenDecimals(fromTokenAddress);
      const toTokenDecimals = await this.getTokenDecimals(toTokenAddress);


      console.log("\n\n")
      console.log("::::::::::TOKEN IN:", fromTokenAddress, "::DECIMALS:", fromTokenDecimals);
      console.log("::::::::::TOKEN OUT:", toTokenAddress, "::DECIMALS:", toTokenDecimals);
      console.log("::::::::::RESERVE IN:", reservesHashtable[fromTokenAddress]);
      console.log("::::::::::RESERVE OUT:", reservesHashtable[toTokenAddress]);

  
      // Convert amountIn from token units to Wei (assuming WETH which has 18 decimals)
      const amountInWei = ethers.parseUnits(amountIn.toString(), 18);

      const amountOut = this.calculateAmountOut(amountInWei, reservesHashtable[fromTokenAddress], reservesHashtable[toTokenAddress]);

      console.log('Calculation:', {
        amountIn: amountInWei,
        reserveOut,
        reserveIn,
        amountOut,
      });

      const routerContract = new ethers.Contract(UNISWAP_V2_ROUTER02_ADDRESS, UNISWAP_V2_ROUTER02_ABI, provider);
      const verifiedAmountsOut = await routerContract.getAmountsOut(
        amountInWei,
        [fromTokenAddress, toTokenAddress]
      );

      // console.log('Verified Amountss Out FULL:');
      // console.log(verifiedAmountsOut) // Debug: print verification

      const verifiedAmountOut_1 = verifiedAmountsOut[1];
      console.log('Verified Amountss Out:', verifiedAmountOut_1); // Debug: print verification



      const verifiedAmountOut_2 = await routerContract.getAmountOut(
        amountInWei,
        reservesHashtable[fromTokenAddress],
        reservesHashtable[toTokenAddress]
      );

      console.log('Verified Amountss Out FULL 2:');
      console.log(verifiedAmountOut_2) // Debug: print verification

  
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

  async getTokenDecimals(tokenAddress: string): Promise<number> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function decimals() view returns (uint8)'],
      provider
    );
    return await tokenContract.decimals();
  }

  async getReserves(fromTokenAddress: string, toTokenAddress: string): Promise<[number, number]> {
    // const factoryContract = new ethers.Contract(UNISWAP_V2_FACTORY_ADDRESS, UNISWAP_V2_FACTORY_ABI, provider);
    // const pairAddress = await factoryContract.getPair(fromTokenAddress, toTokenAddress);
    // console.log("::::::::::PAIR ADDRESS:", pairAddress);


    function sortTokens(tokenA, tokenB) {
      return tokenA.toLowerCase() < tokenB.toLowerCase()
          ? [tokenA, tokenB]
          : [tokenB, tokenA];
    }


    const INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f';

    function getPairAddress(tokenA, tokenB) {
      const [token0, token1] = sortTokens(tokenA, tokenB);
  
      const salt = ethers.solidityPackedKeccak256(['address', 'address'], [token0, token1]);
      const addressBytes = ethers.solidityPacked(
          ['bytes1', 'address', 'bytes32', 'bytes32'],
          ['0xff', UNISWAP_V2_FACTORY_ADDRESS, salt, INIT_CODE_HASH]
      );
  
      const pairAddress = ethers.getAddress(`0x${ethers.keccak256(addressBytes).slice(-40)}`);
      return pairAddress;
    }

    const calculatedPairAddress = getPairAddress(toTokenAddress, fromTokenAddress);
    console.log("::::::::::CALCULATED PAIR ADDRESS:", calculatedPairAddress);


    
    // if (pairAddress === ethers.constants.AddressZero) {
    //   throw new Error('Pair not found');
    // }

    const pairContract = new ethers.Contract(calculatedPairAddress, UNISWAP_V2_PAIR_ABI, provider);
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
