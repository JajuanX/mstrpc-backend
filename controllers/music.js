require("dotenv").config();
const axios = require('axios');
const storefront = 'us'; // Example: 'us' for the United States
const developerToken = process.env.APPLE_MUSIC_KEY; // Your developer token

const searchAppleMusic = async (storefront, searchTerm) => {
	try {
		const response = await axios.get(`https://api.music.apple.com/v1/catalog/${storefront}/search`, {
			params: {
				term: searchTerm,
				types: 'songs'
			},
			headers: {
				'Authorization': `Bearer ${developerToken}`
			}
		});

		return response.data; 
	} catch (error) {
		console.error('Error fetching data from Apple Music API:', error);
		return null;
	}
};

const getSong = async (req, res) => {
	searchAppleMusic(storefront, req.body.search)
		.then(data => {
			if (data) {
				res.json(data)
			}
		});
}


module.exports = {
    getSong,
};