import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { TaskPriority } from './enums/task-priority.enum';
import { TaskQueryDto } from './dto/task-query.dto';
import { Task } from './entities/task.entity';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Task',
    description: 'Test Description',
    dueDate: new Date('2024-12-31'),
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    hasId: () => true,
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
  };

  const mockPaginatedResponse: PaginatedResponseDto<Task> =
    new PaginatedResponseDto([mockTask], {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        name: 'New Task',
        description: 'New Description',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
      };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto);

      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const query: TaskQueryDto = { page: 1, limit: 10 };

      mockTasksService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        {}
      );
    });

    it('should apply filters when fetching tasks', async () => {
      const query: TaskQueryDto = {
        page: 1,
        limit: 10,
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        isActive: true,
      };

      mockTasksService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        { status: TaskStatus.DONE, priority: TaskPriority.HIGH, isActive: true }
      );
    });

    it('should filter by isActive false', async () => {
      const query: TaskQueryDto = {
        page: 1,
        limit: 10,
        isActive: false,
      };

      mockTasksService.findAll.mockResolvedValue(
        new PaginatedResponseDto([], {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        })
      );

      const result = await controller.findAll(query);

      expect(result.data).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        { isActive: false }
      );
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(mockTask.id);

      expect(result).toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith(mockTask.id);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        name: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(mockTask.id, updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(service.update).toHaveBeenCalledWith(mockTask.id, updateTaskDto);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove(mockTask.id);

      expect(service.remove).toHaveBeenCalledWith(mockTask.id);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a task', async () => {
      const softDeletedTask = { ...mockTask, isActive: false };

      mockTasksService.softDelete.mockResolvedValue(softDeletedTask);

      const result = await controller.softDelete(mockTask.id);

      expect(result).toEqual(softDeletedTask);
      expect(service.softDelete).toHaveBeenCalledWith(mockTask.id);
    });
  });
});
