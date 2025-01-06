const statementSchema = require('../models/statement');
const profileSchema = require('../models/profile');

const getStatements = async (_req, res) => {
	try {
		let response = await statementSchema.find({}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve all Blogs')
	}
};

const getStatementsByUser = async (req, res) => {

}

const createStatement = async (req, res) => {
	console.log(req.body);
	try {
		const response = await statementSchema.create(req.body);
		console.log(req.userInfo.profile);
		await profileSchema.findByIdAndUpdate(
			req.userInfo.profile,
			{ $push: { statements: response._id } }, 
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		console.log(err);
		res.status(500).send("Failed to create article");
	}
};

const getStatement = async (req, res) => {
	try {
		const response = await statementSchema.findOne({_id: req.params.id}).populate({
			path: 'user_id',
			select: '-password'
		}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send("Failed to retrieve all Blogs");
	}
};

const updateStatement = async (req, res) => {
	const statementId = req.params.id
	try {
		const response = await statementSchema.findOneAndUpdate({ _id: statementId }, req.body, {new: true});
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send("Failed to update article");
	}
};

const deleteStatement = async (req, res) => {
	const statementId = req.params.id
	try {
		const response = await statementSchema.deleteOne({ _id: statementId });
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send("Failed to delete statement");
	}
};

module.exports = {
    createStatement,
    getStatements,
    getStatement,
	updateStatement,
	deleteStatement,
	getStatementsByUser
};