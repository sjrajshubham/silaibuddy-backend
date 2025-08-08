const bcrypt = require('bcryptjs');
const User = require('../models/User');
module.exports = async function(){
  const admins = [
    { name:'Shubham', email:'shubham@silaibuddy.in', password:'shubham123#' },
    { name:'Rishad', email:'rishad@silaibuddy.in', password:'rishad123#' },
    { name:'Aashna', email:'aashna@silaibuddy.in', password:'aashnasingh123#' }
  ];
  for(const a of admins){
    let u = await User.findOne({email:a.email});
    if(!u){
      const hashed = await bcrypt.hash(a.password,10);
      u = new User({ name:a.name, email:a.email, password:hashed, role:'admin', status:'approved' });
      await u.save();
      console.log('Seeded admin', a.email);
    }
  }
};
