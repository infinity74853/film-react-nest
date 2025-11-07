import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Schedule } from './schedule.entity';

@Unique(['scheduleId', 'row', 'column']) // ← ДОБАВЛЯЕМ ЭТУ СТРОЧКУ
@Entity('orders')
export class Order {
  @PrimaryColumn('uuid')
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
