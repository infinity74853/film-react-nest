import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderDto, TicketDto } from './dto/order.dto';

interface OrderResponse {
  total: number;
  items: Array<TicketDto & { id: string }>;
}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponse> {
    try {
      const order = await this.orderService.createOrder(createOrderDto);
      return {
        total: order.tickets.length,
        items: order.tickets.map((ticket) => ({
          id: order.id,
          ...ticket,
        })),
      };
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  @Post(':id/confirm')
  async confirmOrder(@Param('id') id: string): Promise<OrderDto> {
    try {
      const order = await this.orderService.confirmOrder(id);
      return order;
    } catch (error) {
      console.error('Order confirmation error:', error);
      throw error;
    }
  }

  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<OrderDto> {
    try {
      const order = await this.orderService.getOrder(id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }
}
