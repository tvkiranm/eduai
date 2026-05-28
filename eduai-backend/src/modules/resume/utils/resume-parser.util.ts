import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';
import { BadRequestException } from '@nestjs/common';

export async function extractResumeText(
  file: Express.Multer.File,
): Promise<string> {
  if (!file?.buffer) {
    throw new BadRequestException(
      'File buffer is missing. Ensure `FileInterceptor` uses in-memory storage.',
    );
  }

  const mimetype = file.mimetype;

  if (mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const data = await parser.getText();
      return data.text;
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value;
  }

  throw new BadRequestException('Only PDF and DOCX files are supported');
}
