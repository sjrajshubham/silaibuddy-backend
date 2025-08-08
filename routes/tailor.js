const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/User');

// public: get approved tailors near coords ?lat=&lng=&km=
router.get('/nearby', async (req,res) => {
  try{
    const lat = parseFloat(req.query.lat) || 0;
    const lng = parseFloat(req.query.lng) || 0;
    const km = parseFloat(req.query.km) || 50;
    const tailors = await User.find({
      role:'tailor', status:'approved',
      location: { $near: { $geometry: { type: 'Point', coordinates: [ lng, lat ] }, $maxDistance: km*1000 } }
    }).limit(100);
    res.json(tailors);
  }catch(e){ res.status(500).json({error:e.message}); }
});

// public: get tailor profile
router.get('/:id', async (req,res) => {
  try{ const t = await User.findById(req.params.id); res.json(t); }catch(e){ res.status(500).json({error:e.message}); }
});

// tailor updates own profile (must be logged in)
router.put('/me', auth, async (req,res) => {
  try{
    const user = req.user;
    if(user.role !== 'tailor') return res.status(403).json({msg:'Only tailors'});
    const fields = ['name','services','pricing','photos','location'];
    fields.forEach(f => { if(req.body[f]!==undefined) user[f] = req.body[f]; });
    user.status = 'pending'; // editing resubmits for approval
    await user.save();
    res.json({msg:'Updated (pending approval)'});
  }catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
