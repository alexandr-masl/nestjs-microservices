import { IsEthereumAddress, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * AmountOutDto is a Data Transfer Object that validates and transforms
 * the input data required to calculate the amount out of a token swap.
 */
export class AmountOutDto {
  
  /**
   * The Ethereum address of the token you are swapping from.
   * This is validated to ensure it's a valid Ethereum address.
   */
  @IsEthereumAddress()
  fromTokenAddress: string;

  /**
   * The Ethereum address of the token you are swapping to.
   * This is also validated to ensure it's a valid Ethereum address.
   */
  @IsEthereumAddress()
  toTokenAddress: string;

  /**
   * The amount of tokens you are swapping in. This value is transformed
   * from a string to a number, and validated to ensure it is a positive number.
   * 
   * @example 1.5
   */
  @Transform(({ value }) => parseFloat(value))
  @IsPositive({ message: 'amountIn must be a positive number' })
  amountIn: number;

  /**
   * The amount of tokens you will receive in the swap. This is optional
   * because it is typically calculated by the service and not provided by the user.
   */
  amountOut?: string;
}
