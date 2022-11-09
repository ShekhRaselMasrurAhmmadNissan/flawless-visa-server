const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
	res.send('Flawless Visa server is running.');
});

app.listen(port, () => {
	console.log(`Flawless Visa Server is Running at port: ${port}`);
});
