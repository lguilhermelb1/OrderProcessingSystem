import { Controller, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { RedisService } from '../../common/redis/redis.service';
import { EventPattern, Payload } from '@nestjs/microservices';

interface OrderCreatedPayload {
  orderId: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{ productId: string; quantity: number }>;
}

@Controller()
export class OrdersConsumerController {
  private readonly logger = new Logger(OrdersConsumerController.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: OrderCreatedPayload) {
    this.logger.log(
      `Received order_created event for order ID: ${data.orderId}`,
    );

    const client = await this.databaseService.getClient();

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await client.query('BEGIN');

      for (const item of data.items) {
        const updateStockQuery = await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING id',
          [item.quantity, item.productId],
        );

        if (updateStockQuery.rowCount === 0) {
          throw new Error(
            `Insufficient stock for product ID: ${item.productId}`,
          );
        }
      }

      await client.query(
        `UPDATE orders SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [data.orderId],
      );

      await client.query('COMMIT');
      await this.redisService.del('products:all');
      this.logger.debug(
        `Order ID: ${data.orderId} processed successfully. Stock updated and cache invalidated.`,
      );
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(
        `Error processing order ID: ${data.orderId}. Error: ${error}`,
      );

      throw error;
    } finally {
      client.release();
    }
  }
}
