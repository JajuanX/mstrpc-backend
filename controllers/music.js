import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const storefront = 'us'; // Example: 'us' for the United States
const developerToken = process.env.APPLE_MUSIC_KEY; // Your developer token

export const searchAppleMusic = async (storefront, searchTerm) => {
	try {
		const response = await axios.get(
			`https://api.music.apple.com/v1/catalog/${storefront}/search`,
			{
				params: {
					term: searchTerm,
					types: 'songs',
				},
				headers: {
					Authorization: `Bearer ${developerToken}`,
				},
			}
		);

		return response.data;
	} catch (error) {
		console.error('Error fetching data from Apple Music API:', error);
		return null;
	}
};

export const getSong = async (req, res) => {
	try {
		const data = await searchAppleMusic(storefront, req.body.search);
		if (data) {
			res.json(data);
		} else {
			res.status(500).send('Error retrieving song data from Apple Music API');
		}
	} catch (error) {
		res.status(500).send('An unexpected error occurred');
	}
};
