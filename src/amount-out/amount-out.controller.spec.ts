import { Test, TestingModule } from '@nestjs/testing';
import { AmountOutController } from './amount-out.controller';
import { AmountOutService } from './amount-out.service';
import { AmountOutDto } from './dto/amount-out.dto';

describe('AmountOutController', () => {
  let controller: AmountOutController;
  let service: AmountOutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmountOutController],
      providers: [
        {
          provide: AmountOutService,
          useValue: {
            getAmountOut: jest.fn(), // Mock the getAmountOut method
          },
        },
      ],
    }).compile();

    controller = module.get<AmountOutController>(AmountOutController);
    service = module.get<AmountOutService>(AmountOutService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the expected amount out', async () => {
    // Arrange
    const fromTokenAddress = '0xFromTokenAddress';
    const toTokenAddress = '0xToTokenAddress';
    const amountIn = 1000;

    const expectedResult: AmountOutDto = {
      fromTokenAddress,
      toTokenAddress,
      amountIn,
      amountOut: '100', // Example mock result
    };

    jest.spyOn(service, 'getAmountOut').mockResolvedValue(expectedResult);

    // Act
    const result = await controller.getAmountOut({
      fromTokenAddress,
      toTokenAddress,
      amountIn,
    });

    // Assert
    expect(result).toEqual(expectedResult);
    expect(service.getAmountOut).toHaveBeenCalledWith(fromTokenAddress, toTokenAddress, amountIn);
  });
});
