import { CreateOrderDto, OrderDto } from '../order/dto/order.dto';

export interface OrderRepository {
  create(order: CreateOrderDto): Promise<OrderDto>;
  findById(id: string): Promise<OrderDto | null>;
  confirmOrder(id: string): Promise<OrderDto>;
}
