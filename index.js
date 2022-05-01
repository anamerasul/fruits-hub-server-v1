const express = require('express');
const cors=require('cors')
require('dotenv').config()

const port=process.env.PORT||5000
const app=express()


//middleware
app.use(cors());
app.use(express.json());



// running server on browser
app.get('/', (req, res) =>{
    res.send('fruits-hub server is running and waiting for data')
});

app.listen(port, () =>{
    console.log('John is running on  port', port);
})