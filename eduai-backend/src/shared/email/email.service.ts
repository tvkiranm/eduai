import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  public constructor(private readonly configService: ConfigService) {
    const host =
      this.configService.get<string>('SMTP_HOST') ??
      this.configService.get<string>('MAIL_HOST');
    const port =
      Number(this.configService.get<string>('SMTP_PORT')) ||
      Number(this.configService.get<string>('MAIL_PORT')) ||
      587;
    const user =
      this.configService.get<string>('SMTP_USER') ??
      this.configService.get<string>('MAIL_USERNAME');
    const pass =
      this.configService.get<string>('SMTP_PASS') ??
      this.configService.get<string>('MAIL_PASSWORD');

    const secure = port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  public async verify() {
    try {
      await this.transporter.verify();
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const };
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const fromEmail =
        this.configService.get<string>('SMTP_FROM') ??
        this.configService.get<string>('MAIL_FROM_EMAIL') ??
        this.configService.get<string>('SMTP_USER') ??
        this.configService.get<string>('MAIL_USERNAME');
      const fromName = this.configService.get<string>('MAIL_FROM_NAME');
      const from =
        fromName && fromEmail ? `${fromName} <${fromEmail}>` : fromEmail;

      return await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendForgotPasswordEmail(to: string, resetLink: string) {
    const html = `
      <h2>Reset Your Password</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire soon.</p>
    `;

    return this.sendMail(to, 'Reset your EduAI password', html);
  }
}
