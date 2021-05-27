const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()
const app = express()
const port = 4000

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.static("."));
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.6i5ol.mongodb.net/new-amazon?retryWrites=true&w=majority`;



const stripe = require("stripe")("sk_test_51IeuuaFz4lVH0YokWAp1VJtNSWRqJN28Tr3kVbAUHtVHcUjPqMvTUrPSsyD16UuME7skvcEb0OBmMPjz10Z165st00qe1JVBqt");


app.post("/create-payment-intent", async (req, res) => {
  const { total } = req.body;
 
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: "usd"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ordersCollection = client.db("new-amazon").collection("orders");

  app.get('/findOrders', (req, res)=>{
    ordersCollection.find({email:req.query.email})
    .toArray((err, documents) =>{
      
      res.status(200).send(documents)
    })
  })
  app.post('/addOrders', (req, res)=>{
      const orders = req.body;
      ordersCollection.insertOne(orders)
      .then( result =>{
        res.send(result.insertedCount > 0)
      })
  })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port || process.env.PORT)