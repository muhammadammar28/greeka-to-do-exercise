import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Error details if any',
    required: false,
  })
  error?: any;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    required: false,
    example: '/api/tasks',
  })
  path?: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: any,
    path?: string,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }

  static success<T>(message: string, data?: T, path?: string): ResponseDto<T> {
    return new ResponseDto(true, message, data, undefined, path);
  }

  static error(message: string, error?: any, path?: string): ResponseDto {
    return new ResponseDto(false, message, undefined, error, path);
  }
}