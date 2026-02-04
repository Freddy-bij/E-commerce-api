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

export const orderConfirmationTemplate = (
  firstName: string,
  orderId: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>
) => {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

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
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f5f5f5; padding: 10px; text-align: left; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        .total { font-size: 18px; font-weight: bold; margin-top: 15px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Thank you, ${firstName}!</h2>
          <p>Your order has been successfully placed and is being processed.</p>
          <div class="order-details">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Status:</strong> Pending</p>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              Total Amount: $${total.toFixed(2)}
            </div>
          </div>
          <p>We'll send you another email when your order ships.</p>
        </div>
        <div class="footer">
          <p>© 2024 Your Company. All rights reserved.</p>
          <p>If you have any questions, contact us at support@yourcompany.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const orderStatusTemplate = (
  firstName: string,
  orderId: string,
  status: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>
) => {
  
  const statusConfig: Record<string, { message: string; color: string; emoji: string }> = {
    pending: {
      message: "Your order is being processed",
      color: "#FFA500",
      emoji: "⏳"
    },
    confirmed: {
      message: "Your order has been confirmed",
      color: "#2196F3",
      emoji: "✅"
    },
    processing: {
      message: "We're preparing your order",
      color: "#9C27B0",
      emoji: "📦"
    },
    shipped: {
      message: "Your order is on its way!",
      color: "#4CAF50",
      emoji: "🚚"
    },
    delivered: {
      message: "Your order has been delivered",
      color: "#4CAF50",
      emoji: "🎉"
    },
    cancelled: {
      message: "Your order has been cancelled",
      color: "#F44336",
      emoji: "❌"
    }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig["pending"]!;

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${config.color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-badge { 
          display: inline-block;
          background: ${config.color}; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 14px;
          margin: 10px 0;
        }
        .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f5f5f5; padding: 10px; text-align: left; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        .total { font-size: 16px; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${config.emoji} Order Status Update</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>${config.message}</p>
          
          <div style="text-align: center;">
            <span class="status-badge">${status}</span>
          </div>
          
          <div class="order-details">
            <h3>Order Summary:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              Total: $${total.toFixed(2)}
            </div>
          </div>
          
          ${status.toLowerCase() === 'shipped' ? `
            <p style="background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3;">
              <strong>📍 Track your order:</strong><br>
              Your package is on the way and should arrive within 3-5 business days.
            </p>
          ` : ''}
          
          ${status.toLowerCase() === 'cancelled' ? `
            <p style="background: #ffebee; padding: 15px; border-radius: 5px; border-left: 4px solid #F44336;">
              If you didn't request this cancellation, please contact our support team immediately.
            </p>
          ` : ''}
        </div>
        <div class="footer">
          <p>© 2026 Your Company. All rights reserved.</p>
          <p>If you have any questions, contact us at support@yourcompany.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};