import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `[REQUEST] ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // Log request body for POST/PUT/PATCH requests (be careful with sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method) && request.body) {
      const bodyToLog = this.sanitizeBody(request.body);
      this.logger.debug(`[REQUEST BODY] ${JSON.stringify(bodyToLog)}`);
    }

    // Capture the original send function
    const originalSend = response.send;

    // Override the send function to log the response
    response.send = function (data) {
      response.send = originalSend;
      return response.send(data);
    };

    // Log response on finish
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const responseTime = Date.now() - startTime;

      if (statusCode >= 400) {
        this.logger.error(
          `[RESPONSE] ${method} ${originalUrl} - Status: ${statusCode} - Response Time: ${responseTime}ms - Content Length: ${contentLength}`,
        );
      } else {
        this.logger.log(
          `[RESPONSE] ${method} ${originalUrl} - Status: ${statusCode} - Response Time: ${responseTime}ms - Content Length: ${contentLength}`,
        );
      }
    });

    next();
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
