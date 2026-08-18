import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RedisService } from '../../common/redis/redis.service';
import { DatabaseService } from '../../common/database/database.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, RedisService, DatabaseService],
})
export class ProductsModule {}
