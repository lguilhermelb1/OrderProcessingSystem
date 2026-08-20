import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderRow, OrdersService } from './orders.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates a new order with the provided details. This endpoint is idempotent, meaning that if the same request is sent multiple times with the same idempotency key, it will not create duplicate orders.',
  })
  @ApiResponse({
    status: 202,
    description:
      'Order creation request accepted. The order is being processed.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input data or insufficient stock for one or more products.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Duplicate order creation attempt detected. This request has already been processed.',
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<{ message: string; order: OrderRow }> {
    return this.ordersService.create(createOrderDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  async findOne(@Param('id') id: string): Promise<OrderRow> {
    return this.ordersService.findOne(id);
  }
}
