import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from './activity.entity';

@Entity('votes')
@Unique(['userId', 'activityId'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  activityId: string;

  @Column()
  isUpvote: boolean;

  @ManyToOne(() => User, (user) => user.votes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Activity, (activity) => activity.votes)
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @CreateDateColumn()
  createdAt: Date;
}
