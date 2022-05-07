const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const jwt = require("jsonwebtoken");

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
    const fruitsbannerCollection = client
      .db("allfruitsCollection")
      .collection("allfruitsbanner");
    console.log(`connection too allfruitsCollection`);

    // jwt token in login

    app.post("/login", (req, res) => {
      const email = req.body;
      // const user = req.body

      // crypto.randomBytes(64).toString('hex')

      const accessToken = jwt.sign(
        email,
        process.env.NODE_ACCESS_JWT_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );
      res.send({ accessToken });

      console.log(accessToken);
    });

    // get banner data
    app.get("/banner", async (req, res) => {
      const query = {};
      const cursor = fruitsbannerCollection.find(query);

      const banners = await cursor.toArray();

      res.send(banners);
    });

    // post inventory data

    app.post(`/inventory`, async (req, res) => {
      const newInventory = req.body;
      const result = await fruitsCollection.insertOne(newInventory);

      res.send(result);
    });

    app.post("/products", (req, res) => {});
  } finally {
    //
  }
};

run().catch(console.dir);

// running server on browser
app.get("/", (req, res) => {
  res.send("fruits-hub server is running and waiting for data");
});

app.listen(port, () => {
  console.log("fruitsHub is running on  port", port);
});
