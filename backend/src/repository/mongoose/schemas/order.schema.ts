import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Интерфейс для тикета
interface Ticket {
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
}

export type OrderDocument = Order &
  Document & {
    _id: Types.ObjectId;
    tickets: Ticket[];
    email: string;
    phone: string;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class Order {
  @Prop({
    type: [
      {
        film: String,
        session: String,
        daytime: String,
        row: Number,
        seat: Number,
        price: Number,
      },
    ],
    required: true,
  })
  tickets!: Ticket[];

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  totalPrice!: number;

  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status!: 'pending' | 'confirmed' | 'cancelled';
}

export const OrderSchema = SchemaFactory.createForClass(Order);
