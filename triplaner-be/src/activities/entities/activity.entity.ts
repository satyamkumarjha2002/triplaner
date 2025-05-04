import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { Vote } from './vote.entity';

// Keep the enum for reference, but we won't use it for the column type
export enum ActivityCategory {
  ADVENTURE = 'Adventure',
  FOOD = 'Food',
  SIGHTSEEING = 'Sightseeing',
  OTHER = 'Other',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  time: string;

  @Column({
    type: 'varchar',
    default: 'Other',
  })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column()
  tripId: string;

  @ManyToOne(() => Trip, (trip) => trip.activities)
  trip: Trip;

  @Column()
  creatorId: string;

  @ManyToOne(() => User, (user) => user.createdActivities)
  creator: User;

  @OneToMany(() => Vote, (vote) => vote.activity)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
