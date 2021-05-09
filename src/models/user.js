const mongoose = require('mongoose')
const validator = require('validator')
//import Task model
const Task = require('./task')
//for hasing information 
const bcrypt = require('bcryptjs')
//for authenticating 
const jwt = require('jsonwebtoken')

//user schema 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true, 
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    }, 
    tokens: [{
        token:{
            type: String, 
            required: true
        }
    }],
    avatar:{
        type:Buffer
    }
}, {
    timestamps: true
})


//set up virtual property
//not actual data, but a relationship between two entities(user and task)
userSchema.virtual('myTasks', {
    ref: 'Task', //not stored in the database 
    localField: '_id', //relation between _id and Task
    foreignField: 'owner' //name of the field in Task
})

userSchema.methods.toJSON = function(){
    const user = this 
    const userObject = user.toObject()

    delete userObject.password 
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

//methods allow functions to be defined on instances 
userSchema.methods.generateAuthToken = async function() {
    const user = this 

    //token is signed using the unique _id and secret string 
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET) //toString() because ._id is an ObjectId
    
    //jwt token is added to the tokens array of current user object 
    user.tokens = user.tokens.concat({token})

    //save user object 
    await user.save()

    //returns the jwt token 
    return token
}

//statics allow functions to be defined directly on models 
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email: email})
    
    if(!user){
        throw new Error('Unable to login')
    }
   
    const isMatch = await bcrypt.compare(password, user.password)   
    
    if(!isMatch){
        throw new Error('Unable to login')
    }
   
    return user
}

//Hash the plain text password before saving 
userSchema.pre('save', async function(next){
    const user = this 
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()
})


//Delete User Tasks when user is removed 
userSchema.pre('remove', async function(next){
    const user = this 

    //delete every task with the given ID
    await Task.deleteMany({ owner:user._id })

    next()
})
const User = mongoose.model('User', userSchema)
module.exports = User