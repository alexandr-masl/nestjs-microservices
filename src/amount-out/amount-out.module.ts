import { Module } from '@nestjs/common';
import { AmountOutService } from './amount-out.service';
import { AmountOutController } from './amount-out.controller';
import { TokenBlockchainService } from './handlers/token-blockchain.service';
import { TokenCalculationService } from './handlers/token-calculation.service';
import { TokenHandler } from './handlers/token-handler.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule], // Import the SharedModule, which may include common services like caching or logging
  providers: [
    TokenBlockchainService, // Provides blockchain-related operations, such as fetching token decimals and reserves
    TokenCalculationService, // Handles calculations, such as determining the amount out in token swaps
    TokenHandler, // Orchestrates calls to the other services, applying logic and managing the flow of operations
    AmountOutService, // Main service that handles requests from the controller and interacts with the TokenHandler
  ],
  controllers: [AmountOutController], // Specifies the controller that manages incoming requests and responses
})
export class AmountOutModule {}
