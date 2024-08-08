import { Test, TestingModule } from '@nestjs/testing';
import { AmountOutController } from './amount-out.controller';

describe('AmountOutController', () => {
  let controller: AmountOutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmountOutController],
    }).compile();

    controller = module.get<AmountOutController>(AmountOutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
