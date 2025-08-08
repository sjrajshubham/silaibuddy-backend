const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/signup', async (req,res) => {
  try{
    const { name, email, password, role, location, services, pricing } = req.body;
    if(await User.findOne({email})) return res.status(400).json({msg:'Email exists'});
    const hashed = await bcrypt.hash(password,10);
    const u = new User({ name, email, password:hashed, role, location, services, pricing });
    await u.save();
    res.json({msg:'Registered', userId:u._id});
  }catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/login', async (req,res) => {
  try{
    const { email, password } = req.body;
    const u = await User.findOne({email});
    if(!u) return res.status(400).json({msg:'Invalid credentials'});
    const ok = await bcrypt.compare(password, u.password);
    if(!ok) return res.status(400).json({msg:'Invalid credentials'});
    const token = jwt.sign({ id: u._id, role:u.role }, process.env.JWT_SECRET || 'replace_this_with_a_strong_secret');
    res.json({ token, user: { id:u._id, name:u.name, email:u.email, role:u.role, status:u.status } });
  }catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
