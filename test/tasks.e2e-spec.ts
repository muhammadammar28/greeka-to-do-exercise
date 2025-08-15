import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TaskStatus } from '../src/tasks/enums/task-status.enum';
import { TaskPriority } from '../src/tasks/enums/task-priority.enum';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let createdTaskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/tasks (POST)', () => {
    it('should create a new task', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          name: 'E2E Test Task',
          description: 'This is an E2E test task',
          priority: TaskPriority.HIGH,
          status: TaskStatus.PENDING,
          dueDate: '2024-12-31T23:59:59Z',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('E2E Test Task');
          expect(res.body.data.priority).toBe(TaskPriority.HIGH);
          createdTaskId = res.body.data.id;
        });
    });

    it('should fail to create task with invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          // Missing required 'name' field
          description: 'Invalid task',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });

    it('should fail to create task with invalid enum value', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          name: 'Invalid Priority Task',
          priority: 'INVALID_PRIORITY',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });
  });

  describe('/api/tasks (GET)', () => {
    it('should get all tasks with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('meta');
          expect(Array.isArray(res.body.data.data)).toBe(true);
          expect(res.body.data.meta).toHaveProperty('currentPage');
          expect(res.body.data.meta).toHaveProperty('totalItems');
        });
    });

    it('should filter tasks by status', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .query({ status: TaskStatus.PENDING })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('data');
          const tasks = res.body.data.data;
          tasks.forEach((task: any) => {
            expect(task.status).toBe(TaskStatus.PENDING);
          });
        });
    });

    it('should filter tasks by priority', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .query({ priority: TaskPriority.HIGH })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('data');
        });
    });

    it('should search tasks by name', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .query({ search: 'E2E' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('data');
        });
    });
  });

  describe('/api/tasks/:id (GET)', () => {
    it('should get a single task by id', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/${createdTaskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(createdTaskId);
          expect(res.body.data.name).toBe('E2E Test Task');
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/123e4567-e89b-12d3-a456-426614174999')
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });

    it('should return 400 for invalid UUID', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/invalid-uuid')
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });
  });

  describe('/api/tasks/:id (PATCH)', () => {
    it('should update a task', () => {
      return request(app.getHttpServer())
        .patch(`/api/tasks/${createdTaskId}`)
        .send({
          name: 'Updated E2E Test Task',
          status: TaskStatus.IN_PROGRESS,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Updated E2E Test Task');
          expect(res.body.data.status).toBe(TaskStatus.IN_PROGRESS);
        });
    });

    it('should return 404 when updating non-existent task', () => {
      return request(app.getHttpServer())
        .patch('/api/tasks/123e4567-e89b-12d3-a456-426614174999')
        .send({
          name: 'Updated Task',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });
  });

  describe('/api/tasks/:id/deactivate (PATCH)', () => {
    it('should soft delete a task', () => {
      return request(app.getHttpServer())
        .patch(`/api/tasks/${createdTaskId}/deactivate`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.isActive).toBe(false);
        });
    });
  });

  describe('/api/tasks/:id (DELETE)', () => {
    it('should permanently delete a task', () => {
      return request(app.getHttpServer())
        .delete(`/api/tasks/${createdTaskId}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent task', () => {
      return request(app.getHttpServer())
        .delete('/api/tasks/123e4567-e89b-12d3-a456-426614174999')
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });
  });
});