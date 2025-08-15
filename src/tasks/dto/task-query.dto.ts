import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export class TaskQueryDto {
  // Pagination properties
  @ApiProperty({
    description: 'Page number',
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 50,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  // Filter properties
  @ApiProperty({
    description: 'Filter by task status',
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Filter by task priority',
    enum: TaskPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ obj, key }) => {
    // Get the raw value from the original object before any transformation
    const rawValue = obj[key];

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return undefined;
    }

    if (rawValue === 'true' || rawValue === true) return true;
    if (rawValue === 'false' || rawValue === false) return false;

    return undefined;
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Search by task name',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
