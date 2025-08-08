const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async function(req,res,next){
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if(!token) return res.status(401).json({msg:'No token'});
  try{
    const data = jwt.verify(token, process.env.JWT_SECRET || 'replace_this_with_a_strong_secret');
    req.user = await User.findById(data.id);
    next();
  }catch(e){
    res.status(401).json({msg:'Invalid token'});
  }
}
