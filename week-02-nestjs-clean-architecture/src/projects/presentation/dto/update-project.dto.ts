/**
 * PRESENTATION LAYER, the update-project request DTO. ── part of TASK 3 ──
 *
 * It validates the SHAPE of the PATCH body (boundary validation), not business
 * rules. "Is name a non-empty string?" belongs here; "is that name already
 * taken?" needs to see other projects, so it belongs in the use-case.
 *
 * Heads-up: the global ValidationPipe runs with `whitelist: true`, which STRIPS
 * any property that has no validation decorator. So without the decorators
 * below, `name`/`client` arrive as `undefined` even when the client sent them.
 * That is why this DTO needs its decorators, not just its TypeScript types.
 */
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsOptional()
  client?: string;
}
