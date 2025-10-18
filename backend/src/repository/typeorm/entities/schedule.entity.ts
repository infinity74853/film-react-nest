import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Film } from './film.entity';
import { arrayTransformer, numberTransformer } from '../transformers';

@Entity('schedules')
export class Schedule {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  daytime!: string;

  @Column()
  hall!: number;

  @Column()
  rows!: number;

  @Column()
  seats!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: numberTransformer,
  })
  price!: number;

  @Column('text', {
    transformer: arrayTransformer,
  })
  taken!: string[];

  @Column({ name: 'filmId' })
  filmId!: string;

  @ManyToOne(() => Film, (film) => film.schedules)
  @JoinColumn({ name: 'filmId' })
  film!: Film;
}
