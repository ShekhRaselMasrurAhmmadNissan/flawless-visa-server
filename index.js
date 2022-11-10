const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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

const verifyJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send({ message: 'Unauthorized User' });
	}
	const token = authHeader.split(' ')[1];
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).send({ message: 'Unauthorized User' });
		}
		req.decoded = decoded;
		next();
	});
};

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

		/**
		 * JWT
		 */
		app.post('/jwt', async (req, res) => {
			const user = req.body;
			const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: '1h',
			});
			res.send({ token });
		});

		/**
		 * Services Section
		 */
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

		app.get('/userReviews', verifyJWT, async (req, res) => {
			const decoded = req.decoded;
			console.log('Inside Reviews:', decoded);
			if (decoded.email !== req.query.email) {
				return res.status(403).send({ message: 'Unauthorized User' });
			}
			let query = {};
			if (req.query.email) {
				query = { userEmail: req.query.email };
			}

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

		app.delete('/reviews/:id', verifyJWT, async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };

			const response = await ReviewsCollection.deleteOne(query);
			res.send(response);
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
