const bcrypt=require('bcrypt');
const saltRounds=10

const hashingPws=async(pws)=>{
    let salt= await bcrypt.genSalt(saltRounds);
    let hash=await bcrypt.hash(pws, salt)
    return hash
}

const compairPws=async(pws, hash)=>{
    let result=await bcrypt.compare(pws, hash)
    return result;
}

module.exports={hashingPws,compairPws}