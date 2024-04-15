require("dotenv").config();
const userSchema = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
	const {
		name: { firstName, lastName },
		email,
		username,
		password,
		image_url,
	} = req.body;
	console.log(req.body);

	if (!firstName || !lastName || !email || !password || !username || !image_url) {
		return res.status(400).send("Please enter the required fields.");
	}

	const hashedPassword = bcrypt.hashSync(password);

	// Create the new user
	const newUser = {
		name: {
			firstName,
			lastName,
		},
		email,
		username,
		image_url,
		password: hashedPassword,
		profile: req.profile._id,
	};
	try {
		let response = await userSchema.create(newUser);
		res.status(200).json(response);
	} catch (error) {
		res.status(500).json({errorMsg: "Failed to create new user", error});
	}
};

const loginUser = async (req, res) => {
	const { email, password } = req.body;
	console.log(req.body);
	if (!email || !password) {
		return res.status(400).send("Please enter the required fields");
	}

	// Find the user
	const user = await userSchema.findOne({ email: email }).exec();

	if (!user) {
		return res.status(400).send("Invalid email");
	}

	// Validate the password
	const isPasswordCorrect = bcrypt.compareSync(password, user.password);
	if (!isPasswordCorrect) {
		return res.status(400).send("Invalid password");
	}

	// Generate a token
	const token = jwt.sign(
		{ id: user.id, email: user.email, roles: user.roles },
		process.env.JWT_KEY,
		{ expiresIn: "24h" }
	);

	res.json({ token });
};


const updateUserAdminRights = async (req, res) => {
	const { email, role } = req.body;

	if (!email, !role) {
		return res.status(400).send("Please enter the required fields");
	}

	if(!req.user.roles.includes('admin') || !req.user.roles.includes('super')) {
		return res.status(501).send("You are not authorized access");
	}

	// Find the user
	const user = await userSchema.findOneAndUpdate(
		{ email: email },
		{ $push: { roles: role } },
		{ new: true }
	);

	if (!user) {
		return res.status(400).send("Invalid email");
	}
	res.json(user);
};

const removeAdminRights = async (req, res) => {
	const { email, role } = req.body;

	if ((!email, !role)) {
		return res.status(400).send("Please enter the required fields");
	}

	if(!req.user.roles.includes('admin') && !req.user.roles.includes('super')) {
		return res.status(501).send("You are not authorized access");
	}

	// Find the user
	const user = await userSchema.findOneAndUpdate(
		{ email: email },
		{ $pull: { roles: role } },
		{ new: true }
	);

	if (!user) {
		return res.status(400).send("Invalid email");
	}
	res.json(user);
};

const currentUser = async (req, res) => {
	const currentUser = req.user;
	// todo: Consider not using this, could look at handling this in middleware.
	try {
		let user = await userSchema.findById({ _id: currentUser.id });
		user = user.toObject()
		delete user.password;
		res.status(200).json(user);

	} catch(error) {
		res.status(404).json({})
	}
}

const getUser = async (req, res) => {
	const currentUser = req.user;
	if(currentUser.id !== req.params.id || !req.user.roles.includes('super')) {
		res.status(400).send("User Not Authorized");
	}

	let user = await userSchema.findById({ _id: currentUser.id });
	user = user.toObject()
	delete user.password //.password;
	res.status(200).json(user);
}

const editUser = async (req, res) => {
	const currentUser = req.user;
	const fieldName = req.body.fieldName;
	const value = req.body.value;

	try {
		const response = await userSchema.findOneAndUpdate({ _id: currentUser.id }, { [fieldName]: value },{ new: true });
		// Success
		console.log('Document updated successfully:', response);
		res.status(200).json(response);
	} catch(err) {
		// Handle error
		console.log(err);
		res.status(401).send("Fialed to update field");
	}
}

const editUserProfile = async (req, res) => {
	const currentUser = req.user;
	const updateFields = req.body.fieldName;

	try {
		const response = await userSchema.findByIdAndUpdate(currentUser.id, { $set: updateFields },{ new: true, upsert: true });
		// Success
		res.status(200).json(response);
	} catch(err) {
		// Handle error
		console.log(err);
		res.status(401).send("Fialed to update field");
	}
}

const getUserProfile = async (req, res) => {
	try {
		let userProfile = await userSchema.findOne({ username: req.params.username }) .populate({
			path: 'profile.articles',
			populate: {
				path: 'blogs', // Replace 'blogs' with the actual field name you need to populate
				model: 'Blog' // Replace 'Blog' with the actual model name
			}
		}).select('profile');
		res.status(200).json(userProfile);
		return
	} catch(error) {
		console.log(error);
		res.status(404).send('Failed to get profile')
	}
}

const updateUserRelation = async (req, res) => {
	const { id, field } = req.body;
	console.log(field);
	try {
		const user = await userSchema.findOneAndUpdate(
			{ _id: id },
			{ $push: { [`profile.${field}`]: id } },
			{ new: true }
		);
		console.log(user);
		if (user) {
			res.status(200).json(user)
		}
	} catch(err){
		res.status(404).send('Failed to update user with article')
	}
}

module.exports = {
	updateUserRelation,
	createUser,
	loginUser,
	updateUserAdminRights,
	removeAdminRights,
	currentUser,
	getUser,
	editUser,
	editUserProfile,
	getUserProfile
};
