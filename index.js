const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express()

// middleware
const corsOptions = {
    origin: [
        'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rmxtse.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const roomsCollection = client.db('kinsley').collection('rooms')
        const bookingsCollection = client.db('kinsley').collection('bookings')

        // Get all rooms data from db
        app.get('/rooms', async (req, res) => {
            const result = await roomsCollection.find().toArray()
            res.send(result);
        })

        // Get a single room data from db using room id
        app.get('/room/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await roomsCollection.findOne(query)
            res.send(result);
        })


        // Save a book data from db
        app.post('/book', async (req, res) => {
            const bookData = req.body
            const result = await bookingsCollection.insertOne(bookData)
            res.send(result);
        })

        // get all books posted by a specific user
        app.get('/book/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result);
        })

        app.get('/books/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bookingsCollection.findOne(query)
            res.send(result);
            console.log(result)
        })

        // update a job in db
        app.put('/book/:id', async (req, res) => {
            const id = req.params.id
            const BookData = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...BookData,
                },
            }
            const result = await bookingsCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is running away')
})


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})