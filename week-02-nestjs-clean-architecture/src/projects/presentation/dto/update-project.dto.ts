/**
 * PRESENTATION LAYER, the update-project request DTO. ── part of TASK 3 ──
 *
 * This is a STUB. Build it by modelling it on create-project.dto.ts. It
 * validates the SHAPE of the PATCH body (boundary validation), not business
 * rules.
 *
 * Fields you need:
 *   - name:   required, non-empty string, max 120 chars
 *   - client: optional string
 */
// import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  // TODO(intern), TASK 3: add the validated fields (see create-project.dto.ts).
  name!: string;
  client?: string;
}
