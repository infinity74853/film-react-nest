//TODO реализовать DTO для /orders
export class TicketDto {
  film!: string;
  session!: string;
  daytime!: string;
  row!: number;
  seat!: number;
  price!: number;
}

export class CreateOrderDto {
  tickets!: TicketDto[];
  email?: string;
  phone?: string;
}

export class OrderDto {
  id!: string;
  tickets!: TicketDto[];
  totalPrice!: number;
  status!: 'pending' | 'confirmed' | 'cancelled';
  createdAt!: Date;
}
