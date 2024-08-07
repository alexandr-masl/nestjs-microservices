import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ethers } from 'ethers';
import RabbitMQConsumer from './rabbitmq-consumer';

@Injectable()
export class CronJobService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private readonly logger = new Logger(CronJobService.name);
  private rabbitMQConsumer: RabbitMQConsumer;

  constructor(
    private configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {
    const alchemyApiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    if (!alchemyApiKey) {
      this.logger.error('Alchemy API Key is not configured');
      throw new Error('Alchemy API Key is not configured');
    }
    this.provider = new ethers.JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`);

    // const devMode = process.env.NODE_ENV !== 'production';
    // const rabbitUrl = devMode ? 'amqp://localhost' : 'amqp://guest:guest@rabbitmq';
    const rabbitUrl = 'amqp://localhost';
    this.rabbitMQConsumer = new RabbitMQConsumer(rabbitUrl);
  }

  async onModuleInit() {
    await this.rabbitMQConsumer.connect();
    await this.rabbitMQConsumer.consume('gas-price-update', async (msg) => {
      if (msg) {
        await this.fetchGasPrice();
        this.logger.log('Gas price updated');
      }
    });

    await this.fetchGasPrice();
  }

  async fetchGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      const formattedGasPrice = ethers.formatUnits(feeData.gasPrice, 'gwei');
      this.logger.log(`Fetched gas price: ${formattedGasPrice}`);
      await this.redisClient.set('gasPrice', formattedGasPrice, 'EX', 60); // Cache for 60 seconds
    } catch (error) {
      this.logger.error('Error fetching or setting gas price:', error);
    }
  }
}
