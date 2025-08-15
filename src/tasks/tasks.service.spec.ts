import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { TaskPriority } from './enums/task-priority.enum';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        name: 'New Task',
        description: 'New Description',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
      };

      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto);

      expect(result).toEqual(mockTask);
      expect(mockRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const filterDto: TaskFilterDto = {};
      const tasks = [mockTask];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([tasks, total]);

      const result = await service.findAll(paginationDto, filterDto);

      expect(result.data).toEqual(tasks);
      expect(result.meta.totalItems).toEqual(total);
      expect(result.meta.currentPage).toEqual(1);
      expect(result.meta.itemsPerPage).toEqual(10);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter tasks by status', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const filterDto: TaskFilterDto = { status: TaskStatus.DONE };
      const tasks = [{ ...mockTask, status: TaskStatus.DONE }];

      mockRepository.findAndCount.mockResolvedValue([tasks, 1]);

      const result = await service.findAll(paginationDto, filterDto);

      expect(result.data).toEqual(tasks);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: TaskStatus.DONE }),
        }),
      );
    });

    it('should search tasks by name', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const filterDto: TaskFilterDto = { search: 'Test' };
      const tasks = [mockTask];

      mockRepository.findAndCount.mockResolvedValue([tasks, 1]);

      const result = await service.findAll(paginationDto, filterDto);

      expect(result.data).toEqual(tasks);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.objectContaining({ _type: 'like' }),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(mockTask.id);

      expect(result).toEqual(mockTask);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id },
      });
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        name: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(mockTask.id, updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent task', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(mockTask);

      await service.remove(mockTask.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw NotFoundException when removing non-existent task', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a task', async () => {
      const softDeletedTask = { ...mockTask, isActive: false };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(softDeletedTask);

      const result = await service.softDelete(mockTask.id);

      expect(result.isActive).toBe(false);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when soft deleting non-existent task', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});