import { IsEthereumAddress, IsNumberString } from 'class-validator';

export class AmountOutDto {
  @IsEthereumAddress()
  fromTokenAddress: string;

  @IsEthereumAddress()
  toTokenAddress: string;

  @IsNumberString()
  amountIn: number;

  amountOut?: number;
}