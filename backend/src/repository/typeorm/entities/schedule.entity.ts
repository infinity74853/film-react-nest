import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Film } from './film.entity';
import { Order } from './order.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  daytime!: string;

  @Column('int')
  hall!: number;

  @Column('int')
  rows!: number;

  @Column('int')
  seats!: number;

  @Column('float')
  price!: number;

  @Column('text')
  taken!: string;

  @Column({ name: 'filmId' })
  filmId!: string;

  @ManyToOne(() => Film, (film) => film.schedules)
  @JoinColumn({ name: 'filmId' })
  film!: Film;

  @OneToMany(() => Order, (order) => order.schedule)
  orders!: Order[];
}
