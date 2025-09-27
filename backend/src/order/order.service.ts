import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto, OrderDto } from './dto/order.dto';
import { OrderRepository } from '../repository/order.repository.interface';
@Injectable()
export class OrderService {
  constructor(
    @Inject('OrderRepository') private orderRepository: OrderRepository,
  ) {}
  async createOrder(orderData: CreateOrderDto): Promise<OrderDto> {
    return this.orderRepository.create(orderData);
  }
  async confirmOrder(id: string): Promise<OrderDto> {
    return this.orderRepository.confirmOrder(id);
  }
  async getOrder(id: string): Promise<OrderDto | null> {
    return this.orderRepository.findById(id);
  }
}
