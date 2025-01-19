import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { urlencoded, json } from 'body-parser';
import articlesRoute from './routes/articles.js';
import usersRoute from './routes/users.js';
import uploadsRoute from './routes/uploads.js';
// import openGraphRoute from './routes/openGraph.js';
import musicRoute from './routes/music.js';
import visitRoute from './routes/visit.js';
import blogsRoute from './routes/blogs.js';
import statementsRoute from './routes/statements.js';
import stripeRoute from './routes/stripe.js';
import profilesRoute from './routes/profiles.js';
import emailsRoute from './routes/emails.js';
// import stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(express.static('public'));

// MongoDB Connection
const connectToMongo = async () => {
	try {
		const uri = process.env.ATLAS_URI;
		await mongoose.connect(uri);
		console.log('Connected to MongoDB');
	} catch (err) {
		console.error('Error connecting to MongoDB:', err);
		process.exit(1); // Exit the process if the database connection fails
	}
};

// Routes
app.get('/', (_req, res) => {
	res.send('Welcome to MSTRPC!');
});
app.use('/stripe', stripeRoute);
app.use('/articles', articlesRoute);
app.use('/profiles', profilesRoute);
app.use('/users', usersRoute);
app.use('/uploads', uploadsRoute);
// app.use('/opengraph', openGraphRoute);
app.use('/music', musicRoute);
app.use('/visits', visitRoute);
app.use('/blogs', blogsRoute);
app.use('/statements', statementsRoute);
app.use('/emails', emailsRoute);

// Server Initialization
connectToMongo().then(() => {
	app.listen(PORT, () => {
		console.log(`Server is listening on port ${PORT}`);
	});
});
