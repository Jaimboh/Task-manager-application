const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // INPUT_REQUIRED {Enter your Gmail address}
    pass: process.env.EMAIL_PASS, // INPUT_REQUIRED {Enter your Gmail app password}
  }
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error.message);
    console.error(error.stack);
  }
};

module.exports = { sendEmail };