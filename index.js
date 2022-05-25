const { response } = require('express');
const express=require('express');
const app=express();
const PORT=process.env.PORT||5500
require('./db/config.js');
const users=require('./db/user');
const product=require('./db/products');
const cors=require('cors');
const {hashingPws,compairPws}=require('./db/pwsHashing');
const JWT=require('jsonwebtoken');
const jwtkey='e-com';
app.use(express.json())
app.use(cors())





app.post('/register',async (req, res)=>{    
    console.log(req.body);
    let {email}=req.body;
    let user= await users.findOne({email})
    if(user){
        res.send("Email is already registered.. please login")
    }else{
    const hashedpws= await hashingPws(req.body.password);
    req.body.password=hashedpws;
    let user=new users (req.body)
    let rslt= await user.save();
     JWT.sign({rslt},jwtkey,{expiresIn:'1hr'},(err,token)=>{
        if (err){
            res.send({result:"something went wrong"})
        }
        else{
            res.send({rslt,token})
        }
    })
    }
})

app.post('/login', async (req, res)=>{
    let {email}=req.body
    let user= await users.findOne({email})
    if(user){
        const checkPws=await compairPws(req.body.password, user.password)
        if(checkPws){
            JWT.sign({user},jwtkey,{expiresIn:'1hr'},(err,token)=>{
                if (err){
                    res.send({result:"something went wrong"})
                }
                else{
                    res.send({user,token})
                }
            })
        }else{
            res.send("Wrong Password.. Please enter correct password")
        }
    }else{
        res.send("User doesnt exist.. Please signin")
    }
})

app.post('/addProduct',async (req,res)=>{
    let item= await new product (req.body)
    let resl= await item.save()
    res.send('product added')
})

app.get("/products",verifyToken, async(req,res)=>{
    let prod= await product.find()
    res.send(prod)
})

app.delete('/myproduct/:id', async (req,res)=>{
    let ress= await product.deleteOne({_id:req.params.id})
    res.send(req.params.id)
})

app.put('/product/:id', async (req, res)=>{
    let rss=await product.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }
    )
    res.send('Updated Successfully')
})

app.get('/search/:key',verifyToken, async(req,res)=>{
    let result= await product.find({
        '$or':[
            {name:{$regex: req.params.key}},
            {brand:{$regex:req.params.key}},
            {catogary:{$regex:req.params.key}}
        ]
    })
    res.send(result)
})

function verifyToken(req,res,next){
    let token=req.headers['authorization'];
    if(token){
        JWT.verify(token,jwtkey,(err, valid)=>{
            if (err){
                res.send("Inavlid token ")
            }else{
                next();
            }
        })
    }else{
        res.send('Please submit the token')
    }
}


app.listen(PORT)


