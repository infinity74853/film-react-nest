import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('jsonb')
  tickets!: Array<{
    film: string;
    session: string;
    daytime: string;
    row: number;
    seat: number;
    price: number;
  }>;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status!: 'pending' | 'confirmed' | 'cancelled';

  @CreateDateColumn()
  createdAt!: Date;
}
