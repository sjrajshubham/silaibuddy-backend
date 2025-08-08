const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Review = require('../models/Review');
const User = require('../models/User');

router.post('/', auth, async (req,res)=>{
  try{
    if(req.user.role!=='customer') return res.status(403).json({ msg:'Only customers can review' });
    const { tailorId, rating, comment } = req.body;
    const r = new Review({ customer: req.user._id, tailor: tailorId, rating, comment });
    await r.save();
    // update aggregate
    const reviews = await Review.find({ tailor: tailorId });
    const sum = reviews.reduce((s,rv)=>s+rv.rating,0);
    const avg = sum / reviews.length;
    const t = await User.findById(tailorId);
    if(t){ t.rating = avg; t.ratingCount = reviews.length; await t.save(); }
    res.json({ msg:'Review saved' });
  }catch(e){ res.status(500).json({ error: e.message }); }
});

router.get('/:tailorId', async (req,res)=>{
  try{
    const reviews = await Review.find({ tailor: req.params.tailorId }).populate('customer','name');
    res.json(reviews);
  }catch(e){ res.status(500).json({ error: e.message }); }
});

module.exports = router;
