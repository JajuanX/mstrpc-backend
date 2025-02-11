import tagsSchema from '../models/tags.js';

export const getAll = async (_req, res) => {
	try {
		const response = await tagsSchema.find({}).sort({ count: -1 }).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve all tags');
	}
};

export const generateTags = async (req, res) => {
    const { tags } = req.body;

    if (!Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ message: 'Tags must be a non-empty array.' });
    }

    try {
        const tagOperations = tags.map(tag =>
            tagsSchema.updateOne(
                { tag: tag.toLowerCase() },
                { $setOnInsert: { tag: tag.toLowerCase(), count: 0 } },
                { upsert: true }
            )
        );

        await Promise.all(tagOperations); // Run all operations concurrently

        res.status(200).json({ message: 'Tags added successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add tags.' });
    }
};
