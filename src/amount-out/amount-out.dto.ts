import { IsEthereumAddress, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class AmountOutDto {
  @IsEthereumAddress()
  fromTokenAddress: string;

  @IsEthereumAddress()
  toTokenAddress: string;

  @Transform(({ value }) => parseFloat(value))
  @IsPositive({ message: 'amountIn must be a positive number' })
  amountIn: number;

  amountOut?: string;
}