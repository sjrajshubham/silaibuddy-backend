const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: 'uploads/' });

router.post('/tailor', auth, upload.single('file'), async (req,res)=>{
  try{
    if(req.user.role!=='tailor') return res.status(403).json({ msg:'Only tailors can upload' });
    if(!req.file) return res.status(400).json({ msg:'No file' });
    const uploaded = await cloudinary.uploader.upload(req.file.path, { folder: 'silaibuddy/tailors' });
    // remove temp file
    fs.unlinkSync(req.file.path);
    req.user.photos = req.user.photos || [];
    req.user.photos.push(uploaded.secure_url);
    await req.user.save();
    res.json({ msg:'Uploaded', url: uploaded.secure_url });
  }catch(e){ res.status(500).json({ error: e.message }); }
});

module.exports = router;
