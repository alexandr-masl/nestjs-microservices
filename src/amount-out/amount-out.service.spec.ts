import { Test, TestingModule } from '@nestjs/testing';
import { AmountOutService } from './amount-out.service';

describe('AmountOutService', () => {
  let service: AmountOutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmountOutService],
    }).compile();

    service = module.get<AmountOutService>(AmountOutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
