import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Task } from './entities/task.entity';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { ResponseDto } from '../common/dto/response.dto';
import {
  HttpStatusCode,
  HttpStatusMessage,
} from '../common/constants/http-status.constant';
import { ResponseMessages } from '../common/constants/response-messages.constant';

@ApiTags('Tasks')
@Controller('tasks')
@UseInterceptors(ResponseInterceptor)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: HttpStatusCode.CREATED,
    description: ResponseMessages.TASK.CREATE_SUCCESS,
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatusCode.BAD_REQUEST,
    description: HttpStatusMessage.BAD_REQUEST,
  })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination and filtering' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: ResponseMessages.TASK.FETCH_ALL_SUCCESS,
    type: ResponseDto,
  })
  async findAll(
    @Query() query: TaskQueryDto,
  ): Promise<PaginatedResponseDto<Task>> {
    const { page, limit, ...filters } = query;
    return this.tasksService.findAll({ page, limit }, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: ResponseMessages.TASK.FETCH_SUCCESS,
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: ResponseMessages.TASK.NOT_FOUND,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: ResponseMessages.TASK.UPDATE_SUCCESS,
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: ResponseMessages.TASK.NOT_FOUND,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task permanently' })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatusCode.NO_CONTENT,
    description: ResponseMessages.TASK.DELETE_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: ResponseMessages.TASK.NOT_FOUND,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tasksService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Soft delete a task (set isActive to false)' })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: ResponseMessages.TASK.DEACTIVATE_SUCCESS,
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: ResponseMessages.TASK.NOT_FOUND,
  })
  async softDelete(@Param('id', ParseUUIDPipe) id: string): Promise<Task> {
    return this.tasksService.softDelete(id);
  }
}
