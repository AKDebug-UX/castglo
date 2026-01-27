const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter;

const initEmailService = () => {
  transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });
};

const sendVerificationEmail = async (email, verificationToken, verificationLink) => {
  try {
    const mailOptions = {
      from: config.EMAIL_USER,
      to: email,
      subject: 'Verify Your Castglo Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Castglo!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Or copy and paste this link: ${verificationLink}</p>
          <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      `,
    };

    if (!transporter) {
      initEmailService();
    }

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send verification email');
  }
};

const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  try {
    const mailOptions = {
      from: config.EMAIL_USER,
      to: email,
      subject: 'Reset Your Castglo Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Or copy and paste this link: ${resetLink}</p>
          <p style="color: #666; font-size: 12px;">This link expires in 30 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    if (!transporter) {
      initEmailService();
    }

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send password reset email');
  }
};

const sendApplicationNotification = async (email, castingTitle, talentName) => {
  try {
    const mailOptions = {
      from: config.EMAIL_USER,
      to: email,
      subject: `New Application for ${castingTitle} - Castglo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Application Received</h2>
          <p><strong>${talentName}</strong> has applied to your casting call:</p>
          <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">
            <strong>${castingTitle}</strong>
          </p>
          <p>Log in to your Castglo account to review the application.</p>
        </div>
      `,
    };

    if (!transporter) {
      initEmailService();
    }

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send application notification');
  }
};

const sendApplicationStatusUpdate = async (email, castingTitle, status) => {
  try {
    const statusMessage = {
      shortlisted: 'You have been shortlisted!',
      rejected: 'Unfortunately, you were not selected.',
      accepted: 'Congratulations! You have been accepted!',
    };

    const mailOptions = {
      from: config.EMAIL_USER,
      to: email,
      subject: `Application Status Update - ${castingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Application Status Update</h2>
          <p>${statusMessage[status] || 'Your application status has been updated.'}</p>
          <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">
            <strong>${castingTitle}</strong>
          </p>
          <p>Log in to your Castglo account for more details.</p>
        </div>
      `,
    };

    if (!transporter) {
      initEmailService();
    }

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send status update email');
  }
};

const sendWelcomeEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: config.EMAIL_USER,
      to: email,
      subject: 'Welcome to Castglo!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome, ${fullName}!</h2>
          <p>Thank you for joining Castglo, the ultimate casting marketplace.</p>
          <p>Your account is now active. Log in to start exploring opportunities or posting casting calls.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
      `,
    };

    if (!transporter) {
      initEmailService();
    }

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send welcome email');
  }
};

module.exports = {
  initEmailService,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApplicationNotification,
  sendApplicationStatusUpdate,
  sendWelcomeEmail,
};
