import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('films')
export class Film {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('float')
  rating!: number;

  @Column()
  director!: string;

  @Column('text')
  tags!: string;

  @Column()
  image!: string;

  @Column()
  cover!: string;

  @Column()
  title!: string;

  @Column()
  about!: string;

  @Column()
  description!: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film)
  schedules!: Schedule[];
}
