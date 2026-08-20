import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { RedisModule } from './common/redis/redis.module';
import { DatabaseModule } from './common/database/database.module';
import { OrdersModule } from './modules/orders/orders.module';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),

        // PostgreSQL configuration
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().default(5432),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_MAX_CONNECTIONS: Joi.number().default(20),

        // Redis configuration
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').optional(),

        // RabbitMQ configuration
        RABBITMQ_URL: Joi.string().required(),
        RABBITMQ_ORDERS_QUEUE: Joi.string().required(),
      }),
    }),
    ProductsModule,
    RedisModule,
    DatabaseModule,
    OrdersModule,
  ],
})
export class AppModule {}
