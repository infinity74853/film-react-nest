import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Schedule } from './schedule.entity';
import { arrayTransformer, numberTransformer } from '../transformers';

@Entity('films')
export class Film {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('decimal', {
    precision: 3,
    scale: 1,
    transformer: numberTransformer,
  })
  rating!: number;

  @Column()
  director!: string;

  @Column('text', {
    transformer: arrayTransformer,
  })
  tags!: string[];

  @Column()
  image!: string;

  @Column()
  cover!: string;

  @Column()
  title!: string;

  @Column('text')
  about!: string;

  @Column('text')
  description!: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film)
  schedules!: Schedule[];
}
