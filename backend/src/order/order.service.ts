import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateOrderDto, OrderDto, TicketDto } from './dto/order.dto';
import { OrderRepository } from '../repository/order.repository.interface';

interface OrderResponse {
  total: number;
  items: Array<TicketDto & { id: string }>;
}

@Injectable()
export class OrderService {
  constructor(
    @Inject('OrderRepository') private orderRepository: OrderRepository,
  ) {}

  async createOrder(orderData: CreateOrderDto): Promise<OrderResponse> {
    // Валидация обязательных полей
    if (!orderData.tickets || orderData.tickets.length === 0) {
      throw new BadRequestException('Tickets are required');
    }

    for (const ticket of orderData.tickets) {
      if (!ticket.film || !ticket.session || !ticket.price) {
        throw new BadRequestException('All ticket fields are required');
      }
    }

    try {
      const order = await this.orderRepository.create(orderData);
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

  async confirmOrder(id: string): Promise<OrderDto> {
    try {
      const order = await this.orderRepository.confirmOrder(id);
      return order;
    } catch (error) {
      console.error('Order confirmation error:', error);
      throw error;
    }
  }

  async getOrder(id: string): Promise<OrderDto> {
    try {
      const order = await this.orderRepository.findById(id);
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
