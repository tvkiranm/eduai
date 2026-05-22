import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      return await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
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
