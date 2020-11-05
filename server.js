const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const admin = require('firebase-admin');
const fileUpload=require('express-fileupload')
const fs=require('fs-extra')

app.use(fileUpload())
app.use(express.static('doctors'))

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))
require('dotenv').config()




const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fjsvr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appoinmentCollection = client.db(`${process.env.DB_NAME}`).collection("appoinments");
  const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");
  const doctorsCollection = client.db(`${process.env.DB_NAME}`).collection("doctors");
  // perform actions on the collection object
  app.post('/appoinment-booking',(req,res)=>{
    appoinmentCollection.insertOne(req.body)
    .then(result=>{
      res.send(result.insertedCount>0)
    })
  })
  
  
  app.post('/addUser',(req,res)=>{
    usersCollection.insertOne(req.body)
    .then(result=>{
      res.send({})
    })
  })



  app.get('/appoinment',(req,res)=>{
    appoinmentCollection.find()
        .toArray((error,documents)=>{
          res.send(documents)
        })
    })

    app.get('/appoinment-by-date',(req,res)=>{
      appoinmentCollection.find({date:req.headers.mydate})
      .toArray((error,documents)=>{
        res.send(documents)
      })
    })

    app.post('/add-doctor',(req,res)=>{
      const file=req.files.file
      const name=req.body.name
      const email=req.body.email
      const pathName=`${__dirname}/doctors/${file.name}`

      const newImg=file.data
      const encImg=newImg.toString('base64')
      const image={
        contentType:file.mimetype,
        size:file.size,
        img:Buffer(encImg,'base64')
      }
      doctorsCollection.insertOne({image})
      .then(result=>{
       console.log(result)
       
      })

    })
    app.get('/show-doctors',(req,res)=>{
      doctorsCollection.find({})
      .toArray((error,documents)=>{
        res.send(documents)
      })
    })


});


const PORT = process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log('server is running with '+PORT+' port')
})