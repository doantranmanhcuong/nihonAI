import * as nodemailer from 'nodemailer';

class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('@gmail.com');
        this.transporter = nodemailer.createTransport(
          isGmail
            ? {
                service: 'gmail',
                auth: {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS, // Mật khẩu ứng dụng 16 ký tự của Google
                },
              }
            : {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
                },
              }
        );
        console.log(`✅ MailService initialized with REAL SMTP: ${process.env.SMTP_USER}`);
      } else {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log('ℹ️  MailService running in DEV mode (Ethereal Mock SMTP). Email thật sẽ chỉ được gửi khi cấu hình SMTP_USER và SMTP_PASS trong file server/.env.');
      }
    } catch (err: any) {
      console.warn(`[WARNING] MailService init failed (Offline mode activated). OTP will be printed to console.`);
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string): Promise<void> {
    console.log(`\n======================================================`);
    console.log(`🔑 [MÃ OTP XÁC THỰC] Gửi tới: ${toEmail}`);
    console.log(`MÃ XÁC THỰC: >>> ${otpCode} <<< (Hiệu lực: 15 phút)`);
    console.log(`======================================================\n`);

    if (!this.transporter) {
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: '"NihonAI Academy" <no-reply@nihonai.edu.vn>',
        to: toEmail,
        subject: 'NihonAI - Mã xác thực tài khoản của bạn',
        html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">NihonAI Academy</h1>
  </div>
  
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Chào bạn,</p>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
    Dưới đây là mã xác thực (OTP) dành cho tài khoản của bạn. Mã này có hiệu lực trong vòng <strong>15 phút</strong>:
  </p>
  
  <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a; border-radius: 8px; margin: 30px 0;">
    ${otpCode}
  </div>
  
  <p style="color: #ef4444; font-size: 14px; text-align: center; font-weight: 500;">
    ⚠️ Tuyệt đối không chia sẻ mã này với bất kỳ ai để bảo vệ tài khoản!
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
  <p style="color: #9ca3af; font-size: 14px; text-align: center;">
    Trân trọng,<br/>
    <strong>Đội ngũ NihonAI</strong>
  </p>
</div>
        `,
      });
      
      console.log(`📧  Email sent to ${toEmail}. MessageId: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw new Error('Không thể gửi email OTP.');
    }
  }

  async sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
    if (!this.transporter) { console.log('[SIMULATION] Welcome email for ' + toEmail); return; }
    try {
      await this.transporter.sendMail({
        from: '"NihonAI Academy" <no-reply@nihonai.edu.vn>',
        to: toEmail,
        subject: 'Konnichiwa! Chào mừng bạn đến với NihonAI',
        html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">NihonAI Academy</h1>
    <p style="color: #6b7280; font-size: 16px; margin-top: 5px;">Học Tiếng Nhật Thông Minh</p>
  </div>
  
  <h2 style="color: #1f2937; font-size: 22px;">Konnichiwa ${name}! 🎉</h2>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
    Chúc mừng bạn đã xác thực tài khoản thành công! Chúng tôi rất vui mừng được chào đón bạn gia nhập cộng đồng <strong>NihonAI Academy</strong>.
  </p>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
    Tại đây, bạn có thể rèn luyện tiếng Nhật thông qua các bài báo thực tế, luyện thi JLPT và xây dựng sổ tay cá nhân được hỗ trợ bởi Trí tuệ Nhân tạo (AI).
  </p>
  
  <div style="text-align: center; margin: 35px 0;">
    <a href="http://localhost:3000" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Khám phá ngay</a>
  </div>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
  <p style="color: #9ca3af; font-size: 14px; text-align: center;">
    Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.<br/>
    Trân trọng,<br/>
    <strong>Đội ngũ NihonAI</strong>
  </p>
</div>
        `,
      });
    } catch(e) { console.error('Lỗi gửi Welcome email:', e); }
  }

  async sendPasswordResetSuccessEmail(toEmail: string, name: string): Promise<void> {
    if (!this.transporter) { console.log('[SIMULATION] Password reset success email for ' + toEmail); return; }
    try {
      await this.transporter.sendMail({
        from: '"NihonAI Academy" <no-reply@nihonai.edu.vn>',
        to: toEmail,
        subject: 'Mật khẩu của bạn đã được thay đổi',
        html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">NihonAI Academy</h1>
  </div>
  
  <h2 style="color: #1f2937; font-size: 20px;">Thông báo bảo mật</h2>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Chào ${name},</p>
  <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
    Mật khẩu tài khoản của bạn trên hệ thống NihonAI vừa được thay đổi thành công. 
  </p>
  
  <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
    <p style="margin: 0; color: #92400e; font-size: 14px;">
      <strong>Lưu ý:</strong> Nếu bạn không thực hiện yêu cầu này, vui lòng đổi mật khẩu ngay lập tức hoặc liên hệ bộ phận hỗ trợ để bảo vệ tài khoản.
    </p>
  </div>
  
  <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 40px;">
    Trân trọng,<br/>
    <strong>Đội ngũ NihonAI</strong>
  </p>
</div>
        `,
      });
    } catch(e) { console.error('Lỗi gửi email reset password:', e); }
  }
}

export const mailService = new MailService();
