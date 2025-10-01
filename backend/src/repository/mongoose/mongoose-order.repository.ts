import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Film, FilmDocument } from './schemas/film.schema';
import { CreateOrderDto, OrderDto, TicketDto } from '../../order/dto/order.dto';
import { OrderRepository } from '../order.repository.interface';

@Injectable()
export class MongooseOrderRepository implements OrderRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Film.name) private filmModel: Model<FilmDocument>,
  ) {}

  async create(orderData: CreateOrderDto): Promise<OrderDto> {
    if (!orderData.tickets || orderData.tickets.length === 0) {
      throw new Error('No tickets provided');
    }

    const firstTicket = orderData.tickets[0];
    const film = await this.filmModel.findOne({ id: firstTicket.film }).exec();
    if (!film) throw new Error(`Film not found: ${firstTicket.film}`);

    const session = film.schedule.find(
      (s: { id: string; taken?: string[] }) => s.id === firstTicket.session,
    );
    if (!session) throw new Error(`Session not found: ${firstTicket.session}`);

    // Проверка занятых мест
    const takenSeats = new Set(session.taken || []);
    const newSeats = orderData.tickets.map(
      (ticket: TicketDto) => `${ticket.row}:${ticket.seat}`,
    );

    for (const seat of newSeats) {
      if (takenSeats.has(seat))
        throw new Error(`Seat ${seat} is already taken`);
    }

    const totalPrice = orderData.tickets.reduce(
      (sum: number, ticket: TicketDto) => sum + ticket.price,
      0,
    );

    const order = new this.orderModel({
      tickets: orderData.tickets,
      email: orderData.email || 'user@example.com',
      phone: orderData.phone || '+1234567890',
      totalPrice,
      status: 'pending' as const,
    });

    const savedOrder = await order.save();
    session.taken = [...(session.taken || []), ...newSeats];
    await film.save();

    return {
      id: savedOrder._id.toString(),
      tickets: savedOrder.tickets,
      totalPrice: savedOrder.totalPrice,
      status: savedOrder.status,
      createdAt: savedOrder.createdAt,
    };
  }

  async findById(id: string): Promise<OrderDto | null> {
    const order = await this.orderModel.findById(id).exec();
    return order
      ? {
          id: order._id.toString(),
          tickets: order.tickets,
          totalPrice: order.totalPrice,
          status: order.status,
          createdAt: order.createdAt,
        }
      : null;
  }

  async confirmOrder(id: string): Promise<OrderDto> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status: 'confirmed' as const }, { new: true })
      .exec();

    if (!order) throw new Error('Order not found');

    return {
      id: order._id.toString(),
      tickets: order.tickets,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}
