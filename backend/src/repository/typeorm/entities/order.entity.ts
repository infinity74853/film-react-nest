import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Schedule } from './schedule.entity';

@Unique(['scheduleId', 'row', 'column'])
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') // ← МЕНЯЕМ НА PrimaryGeneratedColumn!
  id!: string;

  @Column()
  name!: string;

  @Column()
  phone!: string;

  @Column()
  email!: string;

  @Column('int')
  tickets!: number;

  @Column('int')
  row!: number;

  @Column('int')
  column!: number;

  @Column({ name: 'scheduleId' })
  scheduleId!: string;

  @ManyToOne(() => Schedule, (schedule) => schedule.orders)
  @JoinColumn({ name: 'scheduleId' })
  schedule!: Schedule;
}
