import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DatabaseService } from '../../common/database/database.service';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_SERVICE_NAME } from './orders.constants';

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface OrderRow {
  id: string;
  customer_email: string;
  total_amount: number;
  status: string;
  idempotency_key: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly dbService: DatabaseService,
    @Inject(RABBITMQ_SERVICE_NAME) private readonly rabbitMqClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const checkIdempotency = await this.dbService.query(
      'SELECT * FROM orders WHERE idempotency_key = $1',
      [createOrderDto.idempotencyKey],
    );

    if (checkIdempotency.rows.length > 0) {
      this.logger.warn(
        `Duplicate order creation attempt detected for idempotency key: ${createOrderDto.idempotencyKey}`,
      );
      throw new ConflictException(
        'Duplicate order creation attempt detected. This request has already been processed.',
      );
    }

    const productIds = createOrderDto.items.map((item) => item.productId);
    const productsQuery = await this.dbService.query(
      'SELECT id, price, stock_quantity FROM products WHERE id = ANY($1::uuid[])',
      [productIds],
    );

    if (productsQuery.rows.length !== productIds.length) {
      this.logger.error('One or more products do not exist');
      throw new BadRequestException('One or more products do not exist');
    }

    const productMap = new Map<string, ProductRow>(
      productsQuery.rows.map((product: ProductRow) => [product.id, product]),
    );

    let totalAmount = 0;
    for (const item of createOrderDto.items) {
      const product = productMap.get(item.productId);
      if (!product || product.stock_quantity < item.quantity) {
        this.logger.error(
          `Insufficient stock for product ID: ${item.productId}`,
        );
        throw new BadRequestException(
          `Insufficient stock for product ID: ${item.productId}`,
        );
      }
      totalAmount += item.quantity * product.price;
    }

    let createdOrder: OrderRow;
    const client = await this.dbService.getClient();

    try {
      await client.query('BEGIN');
      const orderInsertResult = await client.query<OrderRow>(
        'INSERT INTO orders (customer_email, total_amount, status, idempotency_key) VALUES ($1, $2, $3, $4) RETURNING *',
        [
          createOrderDto.customerEmail,
          totalAmount,
          'PENDING',
          createOrderDto.idempotencyKey,
        ],
      );

      createdOrder = orderInsertResult.rows[0];

      for (const item of createOrderDto.items) {
        const product = productMap.get(item.productId);
        if (!product) continue;

        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [createdOrder.id, item.productId, item.quantity, product.price],
        );
      }
      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      this.logger.error('Error creating order', error);
      throw new InternalServerErrorException('Error creating order');
    } finally {
      client.release();
    }

    const orderDetails = {
      orderId: createdOrder.id,
      customerEmail: createdOrder.customer_email,
      totalAmount: createdOrder.total_amount,
      items: createOrderDto.items,
    };

    this.rabbitMqClient.emit('order_created', orderDetails);
    this.logger.log(
      `Order created and event emitted for order ID: ${createdOrder.id}`,
    );

    return {
      message: 'Order created successfully',
      order: createdOrder,
    };
  }

  async findOne(orderId: string) {
    const { rows } = await this.dbService.query<OrderRow>(
      'SELECT * FROM orders WHERE id = $1',
      [orderId],
    );
    if (rows.length === 0) {
      this.logger.warn(`Order not found for ID: ${orderId}`);
      throw new BadRequestException('Order not found');
    }
    return rows[0];
  }
}
