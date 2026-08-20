import { Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { DatabaseService } from '../../common/database/database.service';
import { RedisService } from '../../common/redis/redis.service';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  created_at: Date;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly CACHE_KEY_ALL = 'products:all';
  private readonly TTL_SECONDS = 60;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { rows } = await this.databaseService.query<Product>(
      'INSERT INTO products (name, price, stock_quantity) VALUES ($1, $2, $3) RETURNING *',
      [
        createProductDto.name,
        createProductDto.price,
        createProductDto.stock_quantity,
      ],
    );

    await this.redisService.del(this.CACHE_KEY_ALL);
    this.logger.log('products:all cache invalidated after creation');

    return rows[0];
  }

  async findAll(): Promise<{ data: Product[]; fromCache: boolean }> {
    const cached = await this.redisService.get<Product[]>(this.CACHE_KEY_ALL);

    if (cached) {
      this.logger.log('Returning products from cache');
      return { data: cached, fromCache: true };
    }

    this.logger.log('Fetching products from database');
    const { rows } = await this.databaseService.query<Product>(
      'SELECT * FROM products ORDER BY created_at DESC',
    );

    await this.redisService.set(this.CACHE_KEY_ALL, rows, this.TTL_SECONDS);

    return { data: rows, fromCache: false };
  }
}
