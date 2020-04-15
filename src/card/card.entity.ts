import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('datetime', {})
  createAt: Date;

  @Column('datetime', {})
  updateAt: Date;

  @Column({ default: 0 })
  readLevel: number;

  @Column('datetime', { nullable: true })
  lastReadAt: Date;

  @Column('datetime', {})
  nextReadAt: Date;

  @Column('varchar', {})
  word: string;

  @Column('varchar', { nullable: true })
  context: string;

  @Column('text', { nullable: true })
  picture: string;

  @Column('varchar', { nullable: true })
  audio: string;

  @Column('varchar', {})
  explain: string;

  @Column('varchar', { nullable: true })
  tag: string;

  // 0归档 1正常
  @Column('int', { default: 1 })
  status: number;
}
