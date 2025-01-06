require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express')
const app = express();
const {urlencoded, json} = require('body-parser');
const morgan = require('morgan')
const cors = require('cors')
const articlesRoute = require("./routes/articles");
const usersRoute = require("./routes/users");
const uploadsRoute = require("./routes/uploads");
const openGraphRoute = require("./routes/openGraph");
const musicRoute = require("./routes/music");
const visitRoute = require("./routes/visit");
const blogsRoute = require("./routes/blogs");
const statementsRoute = require("./routes/statements");
const stripeRoute = require("./routes/stripe");
const profilesRoute = require("./routes/profiles");
const emailsRoute = require("./routes/emails");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors())
app.use(morgan('dev'))
app.use(urlencoded({extended: true}))
app.use("/stripe", stripeRoute);
app.use(json())
app.use(express.static('public'));


const connectToMongo = () => {
	const uri = process.env.ATLAS_URI
	return mongoose.connect(uri);
}

app.get('/', (_req, res) => {
	res.send('Welcome to MSTRPC!')
})

app.use("/articles", articlesRoute);
app.use("/profiles", profilesRoute);
app.use("/users", usersRoute);
app.use("/uploads", uploadsRoute);
app.use("/opengraph", openGraphRoute);
app.use("/music", musicRoute);
app.use("/visits", visitRoute);
app.use("/blogs", blogsRoute);
app.use("/statements", statementsRoute);
app.use("/emails", emailsRoute);

connectToMongo()
	.then(() => {
		console.log('connected to mongoDB');
		app.listen(8080, () => {
			console.log("Server is listening on port 8080");
		});
	})
	.catch((err) => {
		console.error(err)
	})


