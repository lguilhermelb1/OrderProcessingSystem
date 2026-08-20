import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../common/database/database.service';
import { RABBITMQ_SERVICE_NAME } from './orders.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_SERVICE_NAME,
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: config.getOrThrow<string>('RABBITMQ_ORDERS_QUEUE'),
            queueOptions: {
              durable: true,
            },
        }
      }),
      inject: [ConfigService],
    },
  ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, DatabaseService],
  exports: [OrdersService]
})
export class OrdersModule {}
