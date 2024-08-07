import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GasPriceService } from './gas-price.service';

const mockRedisClient = {
  set: jest.fn(),
  get: jest.fn(),
};

describe('GasPriceService', () => {
  let service: GasPriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GasPriceService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'ALCHEMY_API_KEY':
                  return 'dummy-alchemy-api-key';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: 'IORedis', // Providing the Redis client directly with a token
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<GasPriceService>(GasPriceService);
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });
});
