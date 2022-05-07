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

    // get invebtory data

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = fruitsCollection.find(query);

      const services = await cursor.toArray();
      res.send(services);
    });
    // post inventory data

    app.post(`/inventory`, async (req, res) => {
      const newInventory = req.body;
      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");
      console.log(email);
      const decoded = verifyJwtToken(accessToken, process.env.ACCESS_TOKEN);
      console.log(decoded);

      // const decoded = verifyToken(accessToken);

      console.log(decoded, decoded.email);

      if (email === decoded.email) {
        const result = await fruitsCollection.insertOne(newInventory);
        res.send({ success: "Product Upload TO INventory successfully" });
        res.send(result);
      } else {
        res.send({ success: "UnAuthoraized Access" });
      }
      // const result = await productCollection.insertOne(product);

      // res.send(result);
    });

    app.post("/products", (req, res) => {});
  } finally {
    //
  }
};

run().catch(console.dir);

const verifyJwtToken = (token) => {
  let email;

  jwt.verify(
    token,
    process.env.NODE_ACCESS_JWT_TOKEN_SECRET,
    function (err, decoded) {
      if (err) {
        email = "invalid";
      }

      if (decoded) {
        console.log(decoded);
        email = decoded;
      }
    }
  );
  return email;
};

// running server on browser
app.get("/", (req, res) => {
  res.send("fruits-hub server is running and waiting for data");
});

app.listen(port, () => {
  console.log("fruitsHub is running on  port", port);
});
