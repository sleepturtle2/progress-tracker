//load mongo connection
require('./db/mongoose')
const express = require('express')
const envCmd = req
//routers 
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')



//The app object conventionally denotes the Express application. Create it by calling the top-level express() function exported by the Express module:
// const express = require('express')
// const { userInfo }  = require('node:os')
const app = express()

const port = process.env.PORT 



// //multer file uploads
// const multer = require('multer')
// const upload = multer({
//     dest: 'images', 
//     limits:{
//         fileSize:1000000
//     }, 
//     fileFilter(request, file, callback){ //function

//         if(!file.originalname.match(/\.(doc|docx)$/)) //regex
//         {
//             return callback(new Error('Please upload a word document'))
//         }

//         // if(!file.originalname.endsWith('.pdf')){
//         //     return callback(new Error('Please upload a PDF'))//first argument in callback is error
//         }

       
//         //callback(undefined, true) //error, boolean response
        
// })

// const errorMiddleWare = (request, response, next)=>{
//     throw new Error('From my middleware')
// }

// //string arg, call to single, then route handler 
// app.post('/upload' , errorMiddleWare, (request, response)=>{
//     response.send()
// }, (error, request, response, next)=>{
//     response.status(400).send({error:error.message})
// })


//adds middleware
app.use(express.json()) //req.body:Contains key-value pairs of data submitted in the request body. By default, it is undefined, and is populated when you use body-parsing middleware such as express.json() or express.urlencoded(). https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded#:~:text=json()%20is%20a%20method,use(express.

app.use(userRouter)
app.use(taskRouter)


app.listen(port, ()=>{
    console.log('Server is up on port '+port)
})

const Task = require('./models/task')
const User = require('./models/user')

/*

const main  = async()=>{
    // //finds user of a particular task 
    // const task = await Task.findById('60912f89a16ca43e801a302a')

    // //populate allows us to populate data from a relationship
    // //finds user associated with this task, their profile will be the entire document as opposed to a property
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)


    //find tasks of a particular user 
    const user = await User.findById('60912f1ea16ca43e801a3025')
    await user.populate('myTasks').execPopulate()
    //console.log(user.myTasks)
}

main()*/