import { ApiProperty } from '@nestjs/swagger';

export class GasPriceDto {
  @ApiProperty({ description: 'The current gas price in gwei' })
  gasPrice: string;
}
