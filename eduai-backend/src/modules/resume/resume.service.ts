import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import { extractResumeText } from './utils/resume-parser.util';
import { OpenRouterService } from '../../shared/llm/openrouter/openrouter.service';

type ResumeAnalysis = {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  profileSummary?: string;
  currentRole?: string;
  experienceYears?: string;
  skills: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  experience?: string[];
  projects?: string[];
  education?: string[];
  strengths?: string[];
  weaknesses?: string[];
  missingSkills?: string[];
  suggestedRoles?: string[];
  recommendedCourses?: string[];
  learningRoadmap?: string[];
  interviewQuestions?: string[];
  resumeScore: number;
  improvementSuggestions?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertIsResumeAnalysis(
  value: unknown,
): asserts value is ResumeAnalysis {
  if (!isRecord(value)) {
    throw new Error('Resume analysis response is not an object');
  }

  if (!isRecord(value.personalInfo)) {
    throw new Error('Resume analysis missing `personalInfo` object');
  }

  if (
    !Array.isArray(value.skills) ||
    !value.skills.every((s) => typeof s === 'string')
  ) {
    throw new Error('Resume analysis missing `skills` string[]');
  }

  if (
    typeof value.resumeScore !== 'number' ||
    !Number.isFinite(value.resumeScore)
  ) {
    throw new Error('Resume analysis missing `resumeScore` number');
  }
}

@Injectable()
export class ResumeService {
  constructor(private readonly openRouterService: OpenRouterService) {}

  async analyzeResume(
    file: Express.Multer.File,
    dto?: AnalyzeResumeDto,
  ): Promise<{ message: string; data: ResumeAnalysis }> {
    const resumeText = await extractResumeText(file);

    if (!resumeText || resumeText.trim().length < 50) {
      throw new BadRequestException('Unable to extract valid resume text');
    }
    console.log(
      'process.env.OPENROUTER_API_KEYprocess.env.OPENROUTER_API_KEYprocess.env.OPENROUTER_API_KEY',
    );
    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      throw new ServiceUnavailableException(
        'AI analysis is not configured (missing OPENROUTER_API_KEY or GROQ_API_KEY)',
      );
    }

    const analysis = await this.generateResumeReport(
      resumeText,
      dto?.jobDescription,
    );

    return {
      message: 'Resume analyzed successfully',
      data: analysis,
    };
  }

  private async generateResumeReport(
    resumeText: string,
    jobDescription?: string,
  ): Promise<ResumeAnalysis> {
    const jdBlock = jobDescription?.trim()
      ? `\nJob Description (optional):\n${jobDescription}\n\nIf job description is provided, tailor missingSkills, suggestedRoles, recommendedCourses, learningRoadmap, and interviewQuestions accordingly.\n`
      : '';

    const system = `You are an expert resume reviewer. Return ONLY valid JSON (no markdown, no code fences, no extra text).

Return a single JSON object with exactly these keys:
- personalInfo { name, email, phone, location }
- profileSummary
- currentRole
- experienceYears
- skills (string[])
- technicalSkills (string[])
- softSkills (string[])
- experience (string[])
- projects (string[])
- education (string[])
- strengths (string[])
- weaknesses (string[])
- missingSkills (string[])
- suggestedRoles (string[])
- recommendedCourses (string[])
- learningRoadmap (string[])
- interviewQuestions (string[])
- resumeScore (number 0-100)
- improvementSuggestions (string[])

If a field is not present in the resume, use an empty string for scalar strings and [] for arrays.`;

    const user = `Analyze the following resume text and extract the required information.\n${jdBlock}\nResume Text:\n${resumeText}`;

    try {
      const parsed = await this.openRouterService.chatJson({
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      });
      assertIsResumeAnalysis(parsed);
      return parsed;
    } catch (error: unknown) {
      console.log('Error--->', error);
      const msg = error instanceof Error ? error.message : String(error);
      throw new ServiceUnavailableException(
        `AI Service currently unavailable. Error: ${msg}`,
      );
    }
  }
}
