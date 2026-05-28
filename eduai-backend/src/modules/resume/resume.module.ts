import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { OpenRouterModule } from '../../shared/llm/openrouter/openrouter.module';

@Module({
  imports: [OpenRouterModule],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
