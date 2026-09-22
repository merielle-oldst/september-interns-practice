/**
 * PRESENTATION LAYER, the create-project request DTO.
 *
 * A DTO validates the SHAPE of what arrives over HTTP (is `name` a non-empty
 * string? is `client` a string?). This is boundary validation, NOT business
 * rules. "No duplicate names" is a business rule and lives in the use-case, the
 * DTO cannot know about other projects.
 *
 * The class-validator decorators are checked by the global ValidationPipe (see
 * main.ts). Bad shapes are rejected with a 400 before any use-case runs.
 */
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsOptional()
  client?: string;
}
