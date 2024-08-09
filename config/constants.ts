import { config } from 'dotenv';
config();

export const PATHS = {
    GAS_PRICE: 'gasPrice',
    AMOUNT_OUT: "return",
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
    GAS_PRICE_FETCH_ERROR: 'Error fetching or setting gas price:',
    MESSAGE_CONSUME_ERROR: "Cannot consume message. Channel not initialized.",
    UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later.",
    GET_AMOUNT_OUT_ERROR: 'Error retrieving AmountOut:',
    FETCH_TOKEN_DETAILS_ERROR: "Failed to fetch token details for address:",
    FETCH_RESERVES_DETAILS_ERROR: "Failed to fetch reserves for pair:",
    CALCULATE_PAIR_ADDRESS_ERROR: "Failed to calculate pair address for:",
    CALCULATE_AMOUNT_OUT_ERROR: "Failed to calculate amount out:",
    INSUFFICIENT_PAIR_LIQUIDITY: "INSUFFICIENT_PAIR_LIQUIDITY"
};

export const INFO_MESSAGES = {
    GAS_PRICE_UPDATED: 'Gas price updated',
    GAS_PRICE_FETCHED: "Fetched gas price",
    GAS_PRICE_DTO_DESCRIPTION: 'The current gas price in gwei'
}

export const SWAGGER = {
    API: {
        TITLE: 'Trading Microservices API',
        DESCRIPTION: 'API to fetch trading data',
        VERSION: '1.0',
        TAG: 'Trading API'
    },
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
    AMOUNT_OUT: {
        SUMMARY: 'Get the return value for the given token addresses and amount',
        RESPONSES: {
          OK: {
            status: 200,
            description: 'Return value successfully calculated',
          },
          ERROR: {
            status: 400,
            description: 'Invalid input parameters',
          },
        },
      },
};

export const UNISWAP = {
    UNISWAP_V2_FACTORY_ADDRESS: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    UNISWAP_V2_FACTORY_INIT_CODE_HASH: "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
    UNISWAP_V2_PAIR_ABI: [
        {
            constant: true,
            inputs: [],
            name: 'getReserves',
            outputs: [
            { internalType: 'uint112', name: '_reserve0', type: 'uint112' },
            { internalType: 'uint112', name: '_reserve1', type: 'uint112' },
            { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
    ]
}