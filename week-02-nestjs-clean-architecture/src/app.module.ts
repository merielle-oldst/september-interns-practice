import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';

/** The root module. It just wires the feature modules together. */
@Module({
  imports: [ProjectsModule],
})
export class AppModule {}
