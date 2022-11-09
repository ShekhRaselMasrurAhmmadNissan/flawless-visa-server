const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

const run = async () => {
	try {
		const ServicesCollection = client
			.db('Flawless-Visa')
			.collection('Services');
		const ReviewsCollection = client
			.db('Flawless-Visa')
			.collection('Reviews');

		app.get('/', async (req, res) => {
			res.send('Flawless Visa server is running.');
		});

		app.get('/services', async (req, res) => {
			const query = {};
			let services;
			if (req.query.limit) {
				const length = parseInt(req.query.limit);
				services = await ServicesCollection.find(query)
					.sort({ _id: -1 })
					.limit(length)
					.toArray();
			} else {
				services = await ServicesCollection.find(query)
					.sort({ _id: -1 })
					.toArray();
			}

			res.send(services);
		});

		app.post('/services', async (req, res) => {
			const service = req.body;
			const response = await ServicesCollection.insertOne(service);
			res.send(response);
		});

		app.get('/services/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const response = await ServicesCollection.findOne(query);
			res.send(response);
		});

		/**
		 * Reviews Section
		 */
		app.get('/servicesReview/:id', async (req, res) => {
			const serviceID = req.params.id;
			const query = { serviceId: serviceID };
			const reviews = await ReviewsCollection.find(query, {
				sort: { createdAt: -1 },
			}).toArray();
			res.send(reviews);
		});

		app.post('/reviews/:id', async (req, res) => {
			const serviceId = req.params.id;
			const reviewDetails = req.body;
			// const service = ObjectId(serviceId);
			const review = { ...reviewDetails, serviceId };
			const result = await ReviewsCollection.insertOne(review);
			res.send(result);
		});
	} catch (error) {
		console.error(error.name, error.message, error.stack);
	} finally {
	}
};

run().catch((error) => console.error(error.name, error.message, error.stack));

app.listen(port, () => {
	console.log(`Flawless Visa Server is Running at port: ${port}`);
});
