/**
 * PRESENTATION LAYER, translate domain errors into HTTP responses.
 *
 * The domain throws framework-free errors (DuplicateProjectNameError, ...). It
 * is NOT the domain's job to know that "duplicate" means HTTP 409. That mapping
 * is an outer-layer concern, and it lives here, at the boundary.
 *
 * Registered globally in main.ts (and in the e2e test setup). It is PROVIDED and
 * already handles every domain error in this exercise, you should not need to
 * touch it.
 */
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from '../domain/project.errors';

const STATUS_BY_ERROR: Record<string, number> = {
  InvalidProjectError: HttpStatus.BAD_REQUEST,
  DuplicateProjectNameError: HttpStatus.CONFLICT,
  ProjectNotFoundError: HttpStatus.NOT_FOUND,
  ProjectAlreadyArchivedError: HttpStatus.CONFLICT,
  ArchivedProjectError: HttpStatus.CONFLICT,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = STATUS_BY_ERROR[exception.name] ?? HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
