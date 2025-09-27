import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type FilmDocument = Film & Document;
@Schema()
export class Session {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) daytime!: string;
  @Prop({ required: true }) hall!: number;
  @Prop({ required: true }) price!: number;
  @Prop({ type: [String], default: [] }) taken: string[] = [];
  @Prop({ default: 10 }) rows!: number;
  @Prop({ default: 100 }) seats!: number;
}
export const SessionSchema = SchemaFactory.createForClass(Session);
@Schema()
export class Film {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) title!: string;
  @Prop({ required: true }) about!: string;
  @Prop({ required: true }) description!: string;
  @Prop({ required: true }) rating!: number;
  @Prop({ required: true }) director!: string;
  @Prop({ type: [String], required: true }) tags: string[] = [];
  @Prop({ required: true }) image!: string;
  @Prop({ required: true }) cover!: string;
  @Prop({ type: [SessionSchema], default: [] }) schedule: Session[] = [];
}
export const FilmSchema = SchemaFactory.createForClass(Film);
