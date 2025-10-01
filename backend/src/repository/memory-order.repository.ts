import { Injectable } from '@nestjs/common';
import { CreateOrderDto, OrderDto, TicketDto } from '../order/dto/order.dto';
import { OrderRepository } from './order.repository.interface';

@Injectable()
export class MemoryOrderRepository implements OrderRepository {
  private orders: OrderDto[] = [];
  private orderIdCounter = 1;

  async create(orderData: CreateOrderDto): Promise<OrderDto> {
    // Валидация входных данных
    if (!orderData.tickets || orderData.tickets.length === 0) {
      throw new Error('No tickets provided');
    }

    // Расчет общей стоимости
    const totalPrice = orderData.tickets.reduce(
      (sum: number, ticket: TicketDto) => sum + ticket.price,
      0,
    );

    const order: OrderDto = {
      id: (this.orderIdCounter++).toString(),
      tickets: orderData.tickets,
      totalPrice,
      status: 'pending',
      createdAt: new Date(),
    };

    this.orders.push(order);
    return order;
  }

  async findById(id: string): Promise<OrderDto | null> {
    return this.orders.find((order) => order.id === id) || null;
  }

  async confirmOrder(id: string): Promise<OrderDto> {
    const order = this.orders.find((order) => order.id === id);
    if (order) {
      order.status = 'confirmed';
      return order;
    }
    throw new Error('Order not found');
  }
}
