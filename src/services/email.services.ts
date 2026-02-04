// src/services/email.service.ts

import { transporter } from "../config/email.config.js";
import { orderConfirmationTemplate, passwordResetTemplate, welcomeEmailTemplate } from "../templates/email.templates.js";


interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (
  email: string, 
  firstName: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Our Platform!',
    html: welcomeEmailTemplate(firstName, email),
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetToken: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: passwordResetTemplate(firstName, resetToken),
  });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  firstName: string,
  orderId: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>
) => {
  try {
     await transporter.sendMail({
    from: `"Your store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - ${orderId}`,
    html: orderConfirmationTemplate(firstName, orderId, total, items),
  });
  console.log(`order confirmation sent to ${email}`)
  } catch (error) {
    console.log('Email sending failed:' , error)
    throw error
  }
};

export const sendOrderStatusUpdate = async (
  email: string,
  firstName: string,
  orderId: string,
  status: string,
  html: string
) => {
  try {
    await transporter.sendMail({
      from: `"Your Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Update: ${status.toUpperCase()} - #${orderId}`,
      html: html,
    });
    console.log(`✅ Status update email sent to ${email} - Status: ${status}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};