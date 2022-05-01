const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

// connection to mongodb

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.jrrqp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// client.connect(err => {
//   const collection = client.db("allfruitsCollection").collection("allfruits");

//   console.log('connection too allfruitsCollection ')
//   // perform actions on the collection object
// });

// async function for mongodb

const run = async () => {
  try {
    await client.connect();

    const fruitsCollection = client
      .db("allfruitsCollection")
      .collection("allfruits");

    console.log(`connection too allfruitsCollection`);
  } finally {
  }
};

run().catch(console.dir);

// running server on browser
app.get("/", (req, res) => {
  res.send("fruits-hub server is running and waiting for data");
});

app.listen(port, () => {
  console.log("John is running on  port", port);
});
