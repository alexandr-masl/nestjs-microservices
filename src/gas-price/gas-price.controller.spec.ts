import { Test, TestingModule } from '@nestjs/testing';
import { GasPriceController } from './gas-price.controller';
import { GasPriceService } from './gas-price.service';

describe('GasPriceController', () => {
  let gasPriceController: GasPriceController;
  let gasPriceService: GasPriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GasPriceController],
      providers: [
        {
          provide: GasPriceService,
          useValue: {
            getCachedGasPrice: jest.fn().mockResolvedValue('4.024355284'),
          },
        },
      ],
    }).compile();

    gasPriceController = module.get<GasPriceController>(GasPriceController);
    gasPriceService = module.get<GasPriceService>(GasPriceService);
  });

  it('should be defined', () => {
    expect(gasPriceController).toBeDefined();
  });

  it('should return cached gas price', async () => {
    const result = await gasPriceController.getGasPrice();
    expect(result).toEqual({ gasPrice: '4.024355284' });
  });
});
