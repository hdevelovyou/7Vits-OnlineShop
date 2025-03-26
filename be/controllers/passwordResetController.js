const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models');
const ResetPassword = require('../models/ResetPassword');
const nodemailer = require('nodemailer');

// Configure email transporter (replace with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '7vits.shop@gmail.com',
    pass: 'tintin1710'
  }
});

// Request password reset
exports.requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate reset token
    const resetString = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (1 hour from now)
    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 1);

    // Delete any existing reset requests
    await ResetPassword.destroy({ where: { userId: user.id } });

    // Create new reset request
    await ResetPassword.create({
      userId: user.id,
      resetString,
      createAt: new Date(),
      expireAt
    });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetString}`;

    // Send email
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Reset password request error:', error);
    res.status(500).json({ message: 'Error processing your request' });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { resetString } = req.params;
    const { password } = req.body;
    
    // Find valid reset request
    const resetRequest = await ResetPassword.findOne({
      where: {
        resetString,
        expireAt: { $gt: new Date() }
      }
    });

    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await User.update(
      { password: hashedPassword },
      { where: { id: resetRequest.userId } }
    );

    // Delete the used reset request
    await ResetPassword.destroy({ where: { id: resetRequest.id } });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};