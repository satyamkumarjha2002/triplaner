import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Trip } from '../../trips/entities/trip.entity';
import { Vote } from '../../activities/entities/vote.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Trip, (trip) => trip.creator)
  createdTrips: Trip[];

  @OneToMany(() => Activity, (activity) => activity.creator)
  createdActivities: Activity[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @OneToMany(() => Invitation, (invitation) => invitation.sender)
  sentInvitations: Invitation[];
} 