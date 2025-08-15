import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        // Check if data already has the response structure
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Check if it's a paginated response
        if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
          return ResponseDto.success(
            'Data retrieved successfully',
            data,
            path,
          );
        }

        // Default response wrapper
        return ResponseDto.success(
          'Operation completed successfully',
          data,
          path,
        );
      }),
    );
  }
}