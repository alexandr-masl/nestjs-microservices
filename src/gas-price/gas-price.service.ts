import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GasPriceDto } from './gas-price.dto';
import { PATHS, ERROR_MESSAGES } from '../../config/constants';
import { DataCacheService } from '../shared/services/data-cache.service';

@Injectable()
export class GasPriceService {
  // Initialize a logger for the service
  private readonly logger = new Logger(GasPriceService.name);

  // Constructor injects the DataCacheService dependency
  constructor(
    private readonly dataCacheService: DataCacheService,
  ) {}

  /**
   * Retrieves the cached gas price from the cache.
   * @returns {Promise<GasPriceDto>} - An object containing the cached gas price.
   * @throws {HttpException} - Throws an error if the gas price is not available or if an unexpected error occurs.
   */
  async getCachedGasPrice(): Promise<GasPriceDto> {
    try {
      // Retrieve the gas price from the cache using the DataCacheService
      const gasPrice = await this.dataCacheService.getCacheValue(PATHS.GAS_PRICE);
      
      // Check if the gas price is not available in the cache
      if (!gasPrice) {
        // Throw an HTTP exception with a 404 status if the gas price is not found
        throw new HttpException(ERROR_MESSAGES.GAS_PRICE_NOT_AVAILABLE, HttpStatus.NOT_FOUND);
      }

      // Return the cached gas price wrapped in a GasPriceDto
      return { gasPrice };
    } catch (error) {
      // Log the error with a custom error message
      this.logger.error(ERROR_MESSAGES.GAS_PRICE_RETRIEVE_ERROR, error);

      // Throw a general HTTP exception with a 500 status for any unexpected errors
      throw new HttpException(ERROR_MESSAGES.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
