const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { isValidObjectId } = require('mongoose')
const router = new express.Router()
//for file uploads
const multer = require('multer')
const sharp = require('sharp')
//create user 
router.post('/users', async(request, response)=>{
    const user = new User(request.body) //User instance 

    try{
        await user.save() //save current User instance
        
        //jwt token is generated from unique id+string, token added to user tokens array, user is saved, and the unique token is returned  
        const token = await user.generateAuthToken() //notice how geenrateAuthToken() is defined on instance, not model
        

        response.status(201).send(user)
    }catch(error){
        response.status(400).send(error)
    }
})

//user login, without auth middleware, check credentials directly 
router.post('/users/login', async (request,response)=>{
    
    try{
       
        //findByCredentials defined on the User model 
        const user = await User.findByCredentials(request.body.email, request.body.password) //notice how findByCredentials is defined on the model, not the instance 
    
        const token = await user.generateAuthToken()
        console.log('Logged in as user '+user.email)
        response.send({user, token})  
    }catch(error){
        response.status(400).send({error:error})
    }
})


//logout user
//if next() is called after successful middleware auth, callback is executed 
router.post('/users/logout', auth, async(request, response)=>{

    try{

        //console.log('request token: '+request.token)
        //tokens array stores all valid session tokens 
        //we want to delete only current token because we want to stay logged in from other devices 


        request.user.tokens = request.user.tokens.filter((token) =>{
            // if(token.token === request.token)
            // console.log(token.token)
            
            return token.token !== request.token
        })

        await request.user.save()

        response.send(request.user)
    }catch(error){
        console.log(error)
        response.status(500).send()
    }
})


//logoutAll, means we need to expire all tokens 
router.post('/users/logoutAll', auth, async(request, response)=>{
    try{
        request.user.tokens = [] //expire all tokens 
        await request.user.save()
        response.send(request.user)
    }catch(error){
        response.status(500).send()
    }
})


//get a particular user, authorized by 'auth' middleware bearer token
router.get('/users/me', auth, async(request, response)=>{
    response.send(request.user)
})


//get a particular user based on id 
router.get('/users/:id', async(request, response)=>{
    const _id = request.params.id

    try{
        const user = await User.findById(_id)

        if(!user){
            return response.status(404).send()
        }

        response.send(user)
    }catch(error){
        response.status(500).send()
    }
})


//Update your profile 
router.patch('/users/me', auth, async(request, response)=>{
    const updates = Object.keys(request.body) //stores all key values 
    
    const allowedUpdates = ['name', 'email', 'password']

    //check if update parameters are valid 
    const isValidOperation = true
    for(i=0; i<updates.length; i++){
        if(!allowedUpdates.includes(updates[i]))
        {
            isValidOperation = false; 
            break; 
        }
    }
    
    if(!isValidOperation){
        return response.status(400).send({error:'Invalid updates!'})
    }

    try{
       
        updates.forEach((update)=> request.user[update] = request.body[update]) //[] notation is used for dynamic values, . for static ones 

        await request.user.save()

        response.send(request.user)
    }catch(error){
        response.status(400).send(error)
    }
})


//delete user by id 
//you should be able to delete only yourself 
router.delete('/users/me', auth, async(request, response)=>{
    try{
        //const user = await User.findByIdAndDelete(request.user._id)

        await request.user.remove()
        response.send(request.user)
    }catch(error){
        response.status(500).send()
    }
})



//use following method for dev purposes only! 
router.get('/users', async(request, response)=>{
    const users = await User.find({})
    response.send(users)
})


const upload = multer({ //if dest property is omitted, it is going to be passed in the next function 
    limits:{
        fileSize:1000000
    }, 
    fileFilter(request, file, callback){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return callback(new Error('Please upload an image'))
        }
        callback(undefined, true) //error, response
    }
})

/*
the images cannot be stored in fs because it gets wiped every time code is pushed for deployment
*/
//multiple middleware 
router.post('/users/me/avatar', auth, upload.single('myAvatar'), async (request, response)=>{
    

    const buffer = await sharp(request.file.buffer).resize({width: 250, height:250}).png().toBuffer()

    //image is passed here for lack of a dest property
    request.user.avatar = buffer

    await request.user.save()
    response.send()
}, (error, request, response, next)=>{
    response.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async(request, response) =>{

    request.user.avatar = undefined //delete user profile 
    await request.user.save()
    response.send()
})


router.get('/users/:id/avatar', async (request, response)=>{
    try{
        const user = await User.findById(request.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        //name to change , value to substitute
        response.set('Content-Type', 'image/png')
        response.send(user.avatar)
    }catch(error){
        response.status(404).send()
    }
})

module.exports = router