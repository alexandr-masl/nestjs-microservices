import { Test, TestingModule } from '@nestjs/testing';
import { GasPriceService } from './gas-price.service';
import { DataCacheService } from '../shared/services/data-cache.service';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockDataCacheService = {
  getCacheValue: jest.fn(),
};

describe('GasPriceService', () => {
  let service: GasPriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GasPriceService,
        {
          provide: DataCacheService,
          useValue: mockDataCacheService,
        },
      ],
    }).compile();

    service = module.get<GasPriceService>(GasPriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return gas price when cached value exists', async () => {
    // Arrange
    const cachedGasPrice = '100';
    mockDataCacheService.getCacheValue.mockResolvedValue(cachedGasPrice);

    // Act
    const result = await service.getCachedGasPrice();

    // Assert
    expect(result).toEqual({ gasPrice: cachedGasPrice });
    expect(mockDataCacheService.getCacheValue).toHaveBeenCalledWith('gasPrice'); // Changed 'GAS_PRICE' to 'gasPrice'
  });

  it('should throw HttpException when gas price is not available', async () => {
    // Arrange
    mockDataCacheService.getCacheValue.mockResolvedValue(null);
  
    // Act & Assert
    await expect(service.getCachedGasPrice()).rejects.toThrowError(
      new HttpException('An unexpected error occurred. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR),
    );
    expect(mockDataCacheService.getCacheValue).toHaveBeenCalledWith('gasPrice');
  });
  

  it('should log error and throw HttpException on failure', async () => {
    // Arrange
    const error = new Error('Something went wrong');
    mockDataCacheService.getCacheValue.mockRejectedValue(error);

    // Act & Assert
    await expect(service.getCachedGasPrice()).rejects.toThrowError(
      new HttpException('An unexpected error occurred. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR),
    );
    expect(mockDataCacheService.getCacheValue).toHaveBeenCalledWith('gasPrice'); // Changed 'GAS_PRICE' to 'gasPrice'
  });
});
