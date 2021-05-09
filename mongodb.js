const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const connectionURL = 'mongodb://127.0.0.1:27019'
const databaseName = 'practice'

MongoClient.connect(connectionURL,
     {useNewUrlParser: true, useUnifiedTopology:true}, 
     (error,client)=>{
    if(error){
        return console.log('Unable to connect to database')
    }

    //client is a MongoClient object
    const db = client.db(databaseName)
    //console.log(db.collection('practice').find({}))
})