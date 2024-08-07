import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ethers } from 'ethers';
import RabbitMQConsumer from './rabbitmq-consumer';
import {PATHS, EVENTS, ERROR_MESSAGES, INFO_MESSAGES} from "../../config/constants";

@Injectable()
export class CronJobService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private readonly logger = new Logger(CronJobService.name);
  private rabbitMQConsumer: RabbitMQConsumer;

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
  ) {

    this.provider = new ethers.JsonRpcProvider(PATHS.ALCHEMY_API);
    const rabbitUrl = PATHS.RABBIT_MQ_ENDPOINT_DEV;
    this.rabbitMQConsumer = new RabbitMQConsumer(rabbitUrl);
  }

  async onModuleInit() {
    await this.rabbitMQConsumer.connect();
    await this.rabbitMQConsumer.consume(EVENTS.GAS_PRICE_UPDATE, async (msg) => {
      if (msg) {
        await this.fetchGasPrice();
        this.logger.log(INFO_MESSAGES.GAS_PRICE_UPDATED);
      }
    });

    await this.fetchGasPrice();
  }

  async fetchGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      const formattedGasPrice = ethers.formatUnits(feeData.gasPrice, 'gwei');
      this.logger.log(`${INFO_MESSAGES.GAS_PRICE_FETCHED}: ${formattedGasPrice}`);
      await this.redisClient.set(PATHS.GAS_PRICE, formattedGasPrice, 'EX', 60);
    } catch (error) {
      this.logger.error(ERROR_MESSAGES.GAS_PRICE_FETCH_ERROR, error);
    }
  }
}
