require("dotenv").config();
const profileSchema = require("../models/profile");
const userSchema = require("../models/user");

const createProfile = async (req, res) => {
	console.log(req.body);
	try {
		const response = await profileSchema.create(req.body);
		res.status(200).json(response);
	} catch (err) {
		console.log(err);
		res.status(500).send("Failed to create article");
	}
};

const getRandomProfiles = async (_req, res) => {
	try {
		const randomProfiles = await profileSchema.aggregate([
			{ $sample: { size: 10 } }, // Randomly selects 10 documents
			{
				$lookup: {
				  from: "users", // The collection to join with
				  localField: "user_id", // The field from the input documents
				  foreignField: "_id", // The field from the documents of the "from" collection
				  as: "user_info" // The array field name in which to store the joined information
				}
			},
			{ $unwind: { path: "$user_info", preserveNullAndEmptyArrays: true }},
			{
				$project: {
					'user_info.password': 0,
					'user_info.session_id': 0,
					'user_info.name': 0,
					'user_info.email': 0,
					'user_info._id': 0,
					'user_info.profile': 0,
					'blogs': 0,
					'links': 0,
					'topFriends': 0,
					'articles': 0,
					'music': 0,
					'user_id': 0,
					
				}
			}
		])
		res.json(randomProfiles)
	} catch(err) {
		console.log(err);
		res.status(401).send("Failed to fetch random profiles");
	}
}


const editProfile = async (req, res) => {
	console.log('here');
	const currentUser = req.user;
	const updateFields = req.body;
	
	try {
		let user = await userSchema.findById({ _id: currentUser.id });
		const response = await profileSchema.findByIdAndUpdate(user.profile._id , { $set: updateFields },{ new: true, upsert: true });
		console.log(response);
		res.status(200).json({result: 'Successfully updated user profile'});
	} catch(err) {
		console.log(err);
		res.status(401).send("Failed to update field");
	}
}

const getProfile = async (req, res) => {
	console.log(req.params);
	try {
		let user = await userSchema.findOne({ username: req.params.username })
			.populate({
				path: 'profile',
				populate: [
					{ path: 'blogs' },
					{ path: 'articles' },
					{ path: 'statements' },
				]
			})

		if(!user) {
			res.status(404).json({error:'Could not find profile'})
			return
		}

		user = user.toObject()
		res.status(200).json({
			...user.profile,
			user_id: user._id
		});
	} catch(error) {
		res.status(404).send('Failed to get profile')
	}
}

const updateProfileRelation = async (req, res) => {
	const { id, field } = req.body;
	console.log(field);
	try {
		const user = await profileSchema.findOneAndUpdate(
			{ _id: id },
			{ $push: {  [`profile.${field}`]: id } },
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
	getProfile,
	editProfile,
	updateProfileRelation,
	createProfile,
	getRandomProfiles
};