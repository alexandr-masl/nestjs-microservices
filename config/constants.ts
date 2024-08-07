import { config } from 'dotenv';
config();

export const PATHS = {
    GAS_PRICE: 'gasPrice',
    RABBIT_MQ_ENDPOINT_DEV: 'amqp://localhost',
    RABBIT_MQ_ENDPOINT_PROD: `amqp://guest:guest@rabbitmq`,
    ALCHEMY_API: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
};
  
export const EVENTS = {
    GAS_PRICE_UPDATE: 'gas-price-update'
};

export const CRON_CONFIG = {
    GAS_PRICE_CRON_SCHEDULE_INTERVAL: "*/7 * * * * *"
}
  
export const ERROR_MESSAGES = {
    GAS_PRICE_NOT_AVAILABLE: 'Gas price not available',
    GAS_PRICE_RETRIEVE_ERROR: 'Error retrieving gas price:',
    GAS_PRICE_RETRIEVE_FAIL: 'Failed to retrieve gas price',
    GAS_PRICE_FETCH_ERROR: 'Error fetching or setting gas price:',
    MESSAGE_CONSUME_ERROR: "Cannot consume message. Channel not initialized."
};

export const INFO_MESSAGES = {
    GAS_PRICE_UPDATED: 'Gas price updated',
    GAS_PRICE_FETCHED: "Fetched gas price",
    GAS_PRICE_DTO_DESCRIPTION: 'The current gas price in gwei'
}

export const SWAGGER = {
    GAS_PRICE: {
        TAG: 'Gas Price',
        SUMMARY: 'Get current gas price',
        RESPONSES: {
        OK: {
            status: 200,
            description: 'Returns the current gas price',
            type: 'GasPriceDto',
        },
        ERROR: {
            status: 500,
            description: 'Internal server error',
        },
        },
    },
};