import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ethers } from 'ethers';
import Redis from 'ioredis';
import * as cron from 'node-cron';

@Injectable()
export class GasPriceService implements OnModuleInit, OnModuleDestroy {
  private provider: ethers.JsonRpcProvider;
  private redisClient: Redis;
  private readonly logger = new Logger(GasPriceService.name);
  private cronJob: cron.ScheduledTask;

  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/lPmyUbpUF1muSEHWM3NW0Q-Str5WA0te');
    this.redisClient = new Redis('redis://localhost:6379');
  }

  async onModuleInit() {
    await this.fetchGasPrice();
    this.scheduleGasPriceUpdate();
  }

  onModuleDestroy() {
    if (this.cronJob) {
        this.cronJob.stop();
        this.logger.log('Cron job stopped');
    }
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

  scheduleGasPriceUpdate() {
    if (this.cronJob) {
        this.cronJob.stop();
        this.logger.log('Existing cron job stopped');
    }
    this.cronJob = cron.schedule('*/7 * * * * *', async () => {
        await this.fetchGasPrice();
        this.logger.log('Gas price updated');
    });
  }

  async getCachedGasPrice(): Promise<string> {
    try {
        const gasPrice = await this.redisClient.get('gasPrice');
        this.logger.log(`Retrieved gas price from Redis: ${gasPrice}`);
        return gasPrice;
    } catch (error) {
        this.logger.error('Error retrieving gas price from Redis:', error);
        return null;
    }
  }
}