import dotenv from 'dotenv';
import ogs from 'open-graph-scraper';

dotenv.config();

export const getOpengraph = async (req, res) => {
	const options = { url: req.body.url };

	try {
		const response = await ogs(options);
		const { result } = response;

		res.json({
			data: { ...result },
			error: null,
		});
	} catch (err) {
		console.error('Failed to retrieve OG Data:', err);

		res.status(400).json({
			data: null,
			error: {
				msg: 'Failed to retrieve OG Data',
				err,
			},
		});
	}
};
