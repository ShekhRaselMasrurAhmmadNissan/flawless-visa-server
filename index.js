const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@flawless-visa.92a8cfb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
console.log(uri);

const run = async () => {
	// const ServicesCollection = client.db('Flawless-Visa').collect;

	app.get('/', async (req, res) => {
		res.send('Flawless Visa server is running.');
	});
};

run().catch((error) => console.error(error.name, error.message, error.stack));

app.listen(port, () => {
	console.log(`Flawless Visa Server is Running at port: ${port}`);
});
