import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderDto, TicketDto } from './dto/order.dto';

interface OrderResponse {
  total: number;
  items: Array<TicketDto & { id: string }>;
}

@Controller('api/afisha/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponse> {
    // Валидация обязательных полей
    if (!createOrderDto.tickets || createOrderDto.tickets.length === 0) {
      throw new BadRequestException('Tickets are required');
    }

    for (const ticket of createOrderDto.tickets) {
      if (!ticket.film || !ticket.session || !ticket.price) {
        throw new BadRequestException('All ticket fields are required');
      }
    }

    try {
      const order = await this.orderService.createOrder(createOrderDto);
      return {
        total: order.tickets.length,
        items: order.tickets.map((ticket) => ({
          id: order.id,
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price,
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      } else {
        throw new BadRequestException('Unknown error occurred');
      }
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
