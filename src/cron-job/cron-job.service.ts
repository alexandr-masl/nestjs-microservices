import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import RabbitMQConsumer from './handlers/rabbitmq-consumer';
import { PATHS, EVENTS, ERROR_MESSAGES, INFO_MESSAGES } from "../../config/constants";
import { DataCacheService } from '../shared/services/data-cache.service';

@Injectable()
export class CronJobService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private readonly logger = new Logger(CronJobService.name); // Logger to log messages
  private rabbitMQConsumer: RabbitMQConsumer;

  constructor(
    private readonly dataCacheService: DataCacheService,  // Inject DataCacheService to handle caching
  ) {
    // Initialize the Ethereum provider using Alchemy API
    this.provider = new ethers.JsonRpcProvider(PATHS.ALCHEMY_API);

    // Initialize RabbitMQConsumer with the provided RabbitMQ endpoint

    const PRODUCTION = process.env.APP === 'PRODUCTION';
    // RabbitMQ endpoint URL for the development environment
    const RABBIT_MQ_ENDPOINT = PRODUCTION ? process.env.RABBIT_MQ_PRODUCTION_URL : PATHS.RABBIT_MQ_ENDPOINT_DEV;
    this.logger.log(`Launching Container: ${PRODUCTION}`);
    this.rabbitMQConsumer = new RabbitMQConsumer(RABBIT_MQ_ENDPOINT);
  }

  // This method runs automatically when the module is initialized
  async onModuleInit() {
    // Connect to RabbitMQ and set up a consumer to listen for gas price update events
    await this.rabbitMQConsumer.connect();
    await this.rabbitMQConsumer.consume(EVENTS.GAS_PRICE_UPDATE, async (msg) => {
      if (msg) {
        await this.fetchGasPrice();  // Fetch the latest gas price when a message is received
        this.logger.log(INFO_MESSAGES.GAS_PRICE_UPDATED);
      }
    });

    // Fetch the initial gas price when the service starts
    await this.fetchGasPrice();
  }

  // Method to fetch the latest gas price from the Ethereum network
  async fetchGasPrice() {
    try {
      const feeData = await this.provider.getFeeData(); // Fetch fee data from the provider
      const formattedGasPrice = ethers.formatUnits(feeData.gasPrice, 'gwei'); // Format the gas price to gwei
      this.logger.log(`${INFO_MESSAGES.GAS_PRICE_FETCHED}: ${formattedGasPrice}`);
      // Cache the gas price with a TTL (Time-To-Live) of 60 seconds
      await this.dataCacheService.setCacheValue(PATHS.GAS_PRICE, formattedGasPrice, 60);
    } catch (error) {
      // Log any errors that occur during the gas price fetch process
      this.logger.error(ERROR_MESSAGES.GAS_PRICE_FETCH_ERROR, error);
    }
  }
}
