const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Order = require('../models/Order');
const User = require('../models/User');

// place order (customer)
router.post('/', auth, async (req,res)=>{
  try{
    if(req.user.role!=='customer') return res.status(403).json({msg:'Only customers can place orders'});
    const { tailorId, service, address, price } = req.body;
    const tailor = await User.findById(tailorId);
    if(!tailor || tailor.status!=='approved') return res.status(400).json({msg:'Tailor not available'});
    const o = new Order({ customer:req.user._id, tailor:tailorId, service, address, price });
    await o.save();
    // notify tailor via socket
    const sockets = req.app.locals.tailorSockets;
    const io = req.app.locals.io;
    if(sockets[tailorId]) io.to(sockets[tailorId]).emit('newOrder', { orderId: o._id, service, address, price });
    res.json({msg:'Order placed', orderId:o._id});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// tailor updates order status
router.post('/:id/status', auth, async (req,res)=>{
  try{
    const o = await Order.findById(req.params.id);
    if(!o) return res.status(404).json({msg:'Not found'});
    if(req.user.role==='tailor' && o.tailor.toString()===req.user._id.toString()){
      o.status = req.body.status; await o.save();
      return res.json({msg:'Updated'});
    }
    res.status(403).json({msg:'Forbidden'});
  }catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
