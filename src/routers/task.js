//task routers need editing based on the final version 

const express = require('express')
//import the task model
const Task = require('../models/task')
//set up router object 
const router = new express.Router()
//auth middleware to authenticate users for task creation
const auth = require('../middleware/auth')


//import the User model 
const User = require('../models/user')
const { ObjectID } = require('bson')


//create 
router.post('/tasks', auth, async (request, response) => {

    const Taskexists = await Task.exists({ name: request.body.name })
    if (Taskexists) {
        return response.send('This task already exists!')
    }

    //console.log(request)

    const task = new Task({
        //...request.body, //ES6 spread operator which will copy all of request.body data to this object 
        name: request.body.name,
        values: {
            value: request.body.value,
            _id: new ObjectID
        },
        owner: request.user._id
    })

    try {
        await task.save()
        response.status(201).send(task)
    } catch (error) {
        response.status(400).send(error)
    }
})

//add values to task 
router.post('/tasks/add', auth, async (request, response) => {
    const Taskexists = await Task.exists({ name: request.body.name })
    if (!Taskexists) {
        return response.status(404).send('Task does not exist. Create new one')
    }

    //if task exists, add to the value
    const task = await Task.findOne({ name: request.body.name }) //there should be only one such task

    //add current value to the list of values in task 
    task.values.push({
        value: request.body.value,
        _id: new ObjectID
    })
    response.send(task)


    try {
        await task.save()
        response.status(201).send()
    } catch (error) {
        response.send(error)
    }
})


//read
router.get('/tasks', auth, async (request, response) => {

    try {
        const tasks = await Task.find({ owner: request.user._id })

        //const user = await User.findById({ _id: request.user._id })
        //console.log('current logged in user: ' + user.email)
        //method 2
        //await request.user.populate('myTasks').execPopulate()
        response.send(tasks)
    } catch (error) {
        response.status(501).send()
    }
})

//read single task by id 
router.get('/tasks/:id', auth, async (request, response) => {
    //const _id = request.params.id
    var user = await User.findById({ _id: request.user._id })

    //console.log(user.email)
    try {
        // const task = await Task.findById(_id)

        const task = await Task.findOne({ _id })
        console.log(request.user._id)
        user = await User.findById({ _id: task.owner })
        console.log(user.email)
        //console.log(_id)

        //6091731f3075ec7336e7e5ae
        //
        if (!task) {
            return response.status(404).send()
        }

        response.send(task)
    } catch (error) {
        response.status(500).send()
    }
})


//update, ie add values to the task to track progress 
router.patch('/tasks/rename/:id', auth, async (request, response) => {
    /*
    const updates = Object.keys(request.body)
    const allowedUpdates = ['value']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return response.status(400).send({ error: "Invalid update!" })
    }*/

    try {

        /*
        //findByIdAndUpdate(id, update with, options)
        //
        // ->new: bool - true to return the modified document rather than the original. defaults to false
        // ->runValidators: if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
        //
        const task = await Task.findByIdAndUpdate(request.params.id, request.body, {new:true, runValidators:true})*/

        const task = await Task.findOne({ _id: request.params.id, owner: request.user._id })


        if (!task) {
            return response.status(404).send('No matching task found')
        }

        //updates.forEach((update) => task[update] = request.body[update])

        response.send(task)
    } catch (error) {
        response.status(404).send(error)
    }
})

//update particular value of a task of the currently logged in user
router.patch('/tasks/updateValue', auth, async (request, response) => {

    const taskID = request.query.taskID
    const valueID = request.query.valueID
    const userID = request.user._id

    try {
        const task = await Task.findById({ _id: taskID, owner: userID })
        
        //change value given
        const newValue = request.body.value
        
        let found=false;
        //search for a given value to update
        for(i=0;i<task.values.length;i++)
        {
            if(task.values[i]._id.toString() === valueID.toString()){
                found = true
                task.values[i].value = newValue
            }
        }

        if(!found){
            return response.send('Given value was not found.')
        }
        await task.save()
        response.send(task)
    } catch (error) {
        response.status(500).send(error)
    }
})


//delete your tasks
router.delete('/tasks/:id', auth, async (request, response) => {
    try {
        //const task = await Task.findByIdAndDelete(request.params.id)

        const task = await Task.findOneAndDelete({ _id: request.params.id, owner: request.user._id })

        if (!task) {
            response.status(404).send()
        }

        response.send(task)
    } catch (error) {
        response.status(500).send()
    }
})

module.exports = router