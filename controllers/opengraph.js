require("dotenv").config();
const ogs = require('open-graph-scraper');

const getOpengraph = async (req, res) => {
	let data = null
	let error = null
	const options = { url: req.body.url };
	ogs(options)
		.then((response) => {
			const { result } = response;
			console.log(result);
			data = {...result}
			res.json({data, error})
		})
		.catch((err) => {
			error = {
				msg: 'Failed to retrieve OG Data',
				err
			}
			res.status(400).json({
				data, error
			})
		})
	};

module.exports = {
    getOpengraph,
};