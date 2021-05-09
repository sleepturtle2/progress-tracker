const jwt = require('jsonwebtoken')
//because User needs to be authenticated
const User = require('../models/user')


//the auth middleware will verfiy the Bearer Token and return the user by its id. proceeds only if successful and next() is called 
const auth = async (request, response, next) =>{
   
    
    try{ 
        
        const token = request.header('Authorization').replace('Bearer ','')

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
       
        const user = await User.findOne({_id:decoded._id, 'tokens.token':token})

        if(!user){
            throw new Error()
        }

        request.token = token
        request.user = user

        console.log('Authentication as user '+ user.email)
       
        next()
    }catch(error){
        response.status(401).send(error)
    }
}

module.exports = auth 

