import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import { ResumeService } from './resume.service';

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const RESUME_MIME_TYPE_REGEX =
  /^(application\/pdf|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;

@ApiTags('resume')
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        jobDescription: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_RESUME_FILE_SIZE_BYTES },
      storage: multer.memoryStorage(),
    }),
  )
  async uploadResume(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_RESUME_FILE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: RESUME_MIME_TYPE_REGEX }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: AnalyzeResumeDto,
  ) {
    return this.resumeService.analyzeResume(file, dto);
  }
}
