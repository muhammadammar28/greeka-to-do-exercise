import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityClass } from '../../common/entities/base.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

@Entity('tasks')
@Index(['isActive'])
@Index(['status'])
@Index(['isActive', 'status'])
export class Task extends BaseEntityClass {
  @ApiProperty({
    description: 'The name/title of the task',
    example: 'Complete project documentation',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Write comprehensive documentation for all API endpoints',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Due date for task completion',
    example: '2024-12-31T23:59:59Z',
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @ApiProperty({
    description: 'Current status of the task',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    default: TaskStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Priority level of the task',
    enum: TaskPriority,
    example: TaskPriority.NORMAL,
    default: TaskPriority.NORMAL,
  })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.NORMAL,
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Indicates if the task is active or soft-deleted',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}