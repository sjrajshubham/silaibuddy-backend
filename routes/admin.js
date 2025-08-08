const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/User');

// Middleware: admin only
router.use(auth, (req,res,next)=>{ if(req.user.role!=='admin') return res.status(403).json({msg:'Admins only'}); next(); });

router.get('/pending-tailors', async (req,res)=>{
  const list = await User.find({ role:'tailor', status:'pending' });
  res.json(list);
});

router.post('/approve/:id', async (req,res)=>{
  const u = await User.findById(req.params.id);
  if(!u) return res.status(404).json({msg:'Not found'});
  u.status = 'approved'; await u.save();
  res.json({msg:'Approved'});
});

router.post('/reject/:id', async (req,res)=>{
  const u = await User.findById(req.params.id);
  if(!u) return res.status(404).json({msg:'Not found'});
  u.status = 'rejected'; await u.save();
  res.json({msg:'Rejected'});
});

router.get('/all-users', async (req,res)=>{ const list = await User.find(); res.json(list); });

module.exports = router;
