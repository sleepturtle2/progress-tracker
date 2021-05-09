const mongoose = require('mongoose')

const connectionURL = process.env.MONGODB_URL



mongoose.connect(connectionURL, {
    useNewUrlParser:true, 
    useCreateIndex: true, 
    useFindAndModify: false, 
    useUnifiedTopology: true, 
    }, 
    (error)=>{ //accepts only error argument
        if(error)
        console.log(error)
    })