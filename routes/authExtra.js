const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Transporter - only works if SMTP env vars are set. If not set, emails are not sent.
let transporter = null;
if(process.env.SMTP_HOST && process.env.SMTP_USER){
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT||587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

router.post('/send-verification', async (req,res)=>{
  try{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ msg:'Not found' });
    user.verifyToken = crypto.randomBytes(24).toString('hex');
    await user.save();
    const link = `${process.env.FRONTEND_URL||'http://localhost:5173'}/verify?token=${user.verifyToken}`;
    if(transporter){
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@silaibuddy.in',
        to: user.email,
        subject: 'Verify your Silaibuddy account',
        html: `<p>Click <a href="${link}">here</a> to verify your account.</p>`
      });
      return res.json({ msg:'Verification email sent' });
    }else{
      // dev mode: return token for manual verification
      return res.json({ msg:'No SMTP configured - development token returned', token: user.verifyToken, link });
    }
  }catch(e){ res.status(500).json({ error: e.message }); }
});

router.get('/verify', async (req,res)=>{
  try{
    const token = req.query.token;
    const user = await User.findOne({ verifyToken: token });
    if(!user) return res.status(400).json({ msg:'Invalid token' });
    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();
    res.json({ msg:'Verified' });
  }catch(e){ res.status(500).json({ error: e.message }); }
});

router.post('/forgot-password', async (req,res)=>{
  try{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ msg:'Not found' });
    user.resetToken = crypto.randomBytes(24).toString('hex');
    user.resetExpires = Date.now() + 3600*1000;
    await user.save();
    const link = `${process.env.FRONTEND_URL||'http://localhost:5173'}/reset-password?token=${user.resetToken}`;
    if(transporter){
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@silaibuddy.in',
        to: user.email,
        subject: 'Reset your Silaibuddy password',
        html: `<p>Reset here: <a href="${link}">reset password</a></p>`
      });
      return res.json({ msg:'Reset email sent' });
    }else{
      return res.json({ msg:'No SMTP configured - development token returned', token: user.resetToken, link });
    }
  }catch(e){ res.status(500).json({ error: e.message }); }
});

router.post('/reset-password', async (req,res)=>{
  try{
    const { token, password } = req.body;
    const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now() } });
    if(!user) return res.status(400).json({ msg:'Invalid or expired token' });
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined; user.resetExpires = undefined;
    await user.save();
    res.json({ msg:'Password updated' });
  }catch(e){ res.status(500).json({ error: e.message }); }
});

module.exports = router;
