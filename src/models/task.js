const mongoose = require('mongoose')


const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    /*value:[{
        type: Number, 
        required: true, 
        default : 0
    }], */
    values: [
        {
            value: {
                type: Number,
                required: true,
                default: 0, 
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId
            }, 
            created_at: {
                type: Date, 
                default: Date.now
            }
        }
    ],
    //User-Task relationship 
    //each task must contain info of user who created it 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //ref allows us to reference 'this' field to another model(like foreign key)
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task