import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

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
