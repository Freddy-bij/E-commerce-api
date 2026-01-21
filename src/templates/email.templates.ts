// src/templates/email.templates.ts

export const welcomeEmailTemplate = (firstName: string, email: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          padding: 10px 20px; 
          background: #4CAF50; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Our Platform!</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Thank you for registering with us. We're excited to have you on board.</p>
          <p>Your account has been successfully created with the email: <strong>${email}</strong></p>
          <p>You can now start exploring our platform and enjoy all the features we offer.</p>
          <a href="https://yourapp.com/login" class="button">Get Started</a>
        </div>
        <div class="footer">
          <p>© 2024 Your Company. All rights reserved.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const passwordResetTemplate = (firstName: string, resetToken: string) => {
  const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF5722; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          padding: 10px 20px; 
          background: #FF5722; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .warning { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <div class="warning">
            <strong>Security Notice:</strong>
            <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const orderConfirmationTemplate = (firstName: string, orderId: string, total: number) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Thank you, ${firstName}!</h2>
          <p>Your order has been successfully placed and is being processed.</p>
          <div class="order-details">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total Amount:</strong> $${total.toFixed(2)}</p>
            <p><strong>Status:</strong> Processing</p>
          </div>
          <p>We'll send you another email when your order ships.</p>
        </div>
        <div class="footer">
          <p>© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};