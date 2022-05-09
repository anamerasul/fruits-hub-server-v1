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

//api  routes

const run = async () => {
  try {
    await client.connect();

    const fruitsCollection = client
      .db("allfruitsCollection")
      .collection("allfruits");
    const orderCollection = client
      .db("allfruitsCollection")
      .collection("allfruitsorder");
    const fruitsbannerCollection = client
      .db("allfruitsCollection")
      .collection("allfruitsbanner");

    const fruitsblogsCollection = client
      .db("allfruitsCollection")
      .collection("allfruitsblogs");
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

    app.get("/blogs", async (req, res) => {
      const query = {};
      const cursor = fruitsblogsCollection.find(query);

      const blogs = await cursor.toArray();

      res.send(blogs);
    });

    // get invebtory data

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = fruitsCollection.find(query);

      const items = await cursor.toArray();
      res.send(items);
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const item = await fruitsCollection.findOne(query);
      res.send(item);
    });

    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updateInventory = req.body;
      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");
      console.log(email);
      const decoded = verifyJwtToken(accessToken, process.env.ACCESS_TOKEN);
      console.log(decoded);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          DeliverdQuantiy: updateInventory.DeliverdQuantiy + 1,
          StockQuantity: updateInventory.StockQuantity - 1,
        },
      };

      if (email === decoded.email) {
        const result = await fruitsCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send({ success: "Product Update successfully" });
        // res.send(result);
      } else {
        // res.send({ success: "UnAuthoraized Access" });
        res.status(403).send({ message: "forbidden access" });
      }
    });

    app.get("/inventory-count", async (req, res) => {
      const count = await fruitsCollection.estimatedDocumentCount();
      res.send({ count });
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
        // res.send(result);
      } else {
        // res.send({ success: "UnAuthoraized Access" });
        res.status(403).send({ message: "forbidden access" });
      }
      // const result = await productCollection.insertOne(product);

      // res.send(result);
    });

    app.get("/allorders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);

      const items = await cursor.toArray();
      res.send(items);
    });

    // get order spefic user

    app.get("/orders", async (req, res) => {
      const tokenInfo = req.headers.authorization;

      console.log(tokenInfo);
      const [email, accessToken] = tokenInfo.split(" ");
      // console.log(email, accessToken)

      const decoded = verifyJwtToken(accessToken);

      if (email === decoded.email) {
        const orders = await orderCollection.find({ email: email }).toArray();
        res.send(orders);
      } else {
        res.send({ success: "UnAuthoraized Access" });
      }
    });

    app.get("/allorders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const item = await orderCollection.findOne();
      res.send(item);
    });

    // deleteorder

    app.delete("/allorders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");
      const decoded = verifyJwtToken(accessToken, process.env.ACCESS_TOKEN);
      if (email === decoded.email) {
        const result = await orderCollection.deleteOne(query);
        res.send({ success: "Product Delete successfully" });
        // res.send(result);
      } else {
        // res.send({ success: "UnAuthoraized Access" });
        res.status(403).send({ message: "forbidden access" });
      }
    });

    app.post("/orders", async (req, res) => {
      const orderInfo = req.body;
      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");
      console.log(email);
      const decoded = verifyJwtToken(accessToken, process.env.ACCESS_TOKEN);
      console.log(decoded);

      console.log(decoded, decoded.email);

      if (email === decoded.email) {
        const result = await orderCollection.insertOne(orderInfo);
        res.send({ success: "Product ADD TO USER successfully" });
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });

    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updateInventory = req.body;
      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");
      console.log(email);
      const decoded = verifyJwtToken(accessToken, process.env.ACCESS_TOKEN);
      console.log(decoded);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          myquantity: updateInventory.myquantity,
        },
      };

      if (email === decoded.email) {
        const result = await orderCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send({ success: "Product Update successfully" });
        // res.send(result);
      } else {
        // res.send({ success: "UnAuthoraized Access" });
        res.status(403).send({ message: "forbidden access" });
      }
    });

    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const item = await fruitsCollection.findOne(query);
      res.send(item);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updateInventory = req.body;
      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");
      console.log(email);
      const decoded = verifyJwtToken(accessToken, process.env.ACCESS_TOKEN);
      console.log(decoded);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          // StockQuantity: updateInventory.newStockQuantity,
          StockQuantity: updateInventory.StockQuantity + 1,
        },
      };

      if (email === decoded.email) {
        const result = await fruitsCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send({ success: "Product Update successfully" });
        // res.send(result);
      } else {
        // res.send({ success: "UnAuthoraized Access" });
        res.status(403).send({ message: "forbidden access" });
      }
    });

    // delete products

    app.delete("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");
      const decoded = verifyJwtToken(accessToken, process.env.ACCESS_TOKEN);
      if (email === decoded.email) {
        const result = await fruitsCollection.deleteOne(query);
        res.send({ success: "Product Delete successfully" });
        // res.send(result);
      } else {
        // res.send({ success: "UnAuthoraized Access" });
        res.status(403).send({ message: "forbidden access" });
      }
    });
    // app.post("/products", (req, res) => {});

    app.get("/manageinventory", async (req, res) => {
      const query = req.body;
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      console.log(query);

      console.log(req.query);
      const cursor = fruitsCollection.find(query);

      let inventories;

      if (page || size) {
        inventories = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        inventories = await cursor.toArray();
      }

      res.send(inventories);
    });

    app.get("/inventory-count", async (req, res) => {
      const count = await fruitsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // use post product by id

    app.post("/inventoryByKeys", async (req, res) => {
      const keys = req.body;
      const ids = keys.map((id) => ObjectId(id));
      const query = { _id: { $in: ids } };
      const cursor = fruitsCollection.find(query);

      const inventories = await cursor.toArray();
      console.log(keys);

      res.send(inventories);
    });
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
  res.send(`
  <!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

    <title>FRUITS HUB </title>
  </head>
  <body>
    <h1 class="text-primary text-center my-5 py-5">WELCOME TO FRUITS HUB SERVER</h1>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>

  </body>
</html>
  
  `);
});

app.listen(port, () => {
  console.log("fruitsHub is running on  port", port);
});
