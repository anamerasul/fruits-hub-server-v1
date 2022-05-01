const express = require('express');
const cors=require('cors')

const port=process.env.PORT||5000
const app=express()


//middleware



app.get('/', (req, res) =>{
    res.send('fruits-hub server is running and waiting for data')
});

app.listen(port, () =>{
    console.log('John is running on  port', port);
})