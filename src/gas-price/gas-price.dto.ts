import { ApiProperty } from '@nestjs/swagger';
import {INFO_MESSAGES} from "../../config/constants";

export class GasPriceDto {
  @ApiProperty({ description: INFO_MESSAGES.GAS_PRICE_DTO_DESCRIPTION })
  gasPrice: string;
}
