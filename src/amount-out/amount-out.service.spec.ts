import { Test, TestingModule } from '@nestjs/testing';
import { AmountOutService } from './amount-out.service';
import { TokenHandler } from './handlers/token-handler.service';

describe('AmountOutService', () => {
  let service: AmountOutService;
  let tokenHandler: TokenHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmountOutService,
        {
          provide: TokenHandler,
          useValue: {
            getAmountOut: jest.fn(), // Mock the getAmountOut method
          },
        },
      ],
    }).compile();

    service = module.get<AmountOutService>(AmountOutService);
    tokenHandler = module.get<TokenHandler>(TokenHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the expected amount out', async () => {
    // Arrange
    const fromTokenAddress = '0xFromTokenAddress';
    const toTokenAddress = '0xToTokenAddress';
    const amountIn = 1000;
    const expectedAmountOut = '500';

    jest.spyOn(tokenHandler, 'getAmountOut').mockResolvedValue(expectedAmountOut);

    // Act
    const result = await service.getAmountOut(fromTokenAddress, toTokenAddress, amountIn);

    // Assert
    expect(result).toEqual({
      fromTokenAddress,
      toTokenAddress,
      amountIn,
      amountOut: expectedAmountOut,
    });
    expect(tokenHandler.getAmountOut).toHaveBeenCalledWith(fromTokenAddress, toTokenAddress, amountIn);
  });
});
