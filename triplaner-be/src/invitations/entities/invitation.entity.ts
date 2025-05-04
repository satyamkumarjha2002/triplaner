import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Trip } from '../../trips/entities/trip.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tripId: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: string;

  @Column({ nullable: true })
  senderId: string;

  @Column({ nullable: true, type: 'text' })
  declineReason: string;

  @ManyToOne(() => User, (user) => user.sentInvitations, { nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => Trip, (trip) => trip.invitations)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
