import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderDto } from './dto/order.dto';

@Controller('api/afisha/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.createOrder(createOrderDto);
  }

  @Post(':id/confirm')
  async confirmOrder(@Param('id') id: string): Promise<OrderDto> {
    return await this.orderService.confirmOrder(id);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<OrderDto> {
    return await this.orderService.getOrder(id);
  }
}
