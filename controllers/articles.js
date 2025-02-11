import articleSchema from '../models/article.js';
import profileSchema from '../models/profile.js';
import tagsSchema from '../models/tags.js';

export const getArticles = async (_req, res) => {
	try {
		const response = await articleSchema.find({}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve all articles');
	}
};

export const createArticle = async (req, res) => {
	console.log(req.body);
    try {
        const { tag } = req.body; // Assuming a single tag is passed

        // Create the article
        const response = await articleSchema.create(req.body);

        // Update tag count if tag exists
        if (tag) {
            const response = await tagsSchema.updateOne(
                { tag },
                { $inc: { count: 1 } }, 
                { upsert: true, setDefaultsOnInsert: true } 
            );

			console.log(response);
			
        }

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send('Failed to create article');
    }
};

export const getArticle = async (req, res) => {
	try {
		const response = await articleSchema.findOne({ _id: req.params.id }).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve article');
	}
};

export const updateArticle = async (req, res) => {
	const articleId = req.params.id;
	try {
		const response = await articleSchema.findOneAndUpdate(
			{ _id: articleId },
			req.body,
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send('Failed to update article');
	}
};

export const deleteArticle = async (req, res) => {
	const articleId = req.params.id;
	const profileId = req.params.profileId;
	try {
		const response = await articleSchema.deleteOne({ _id: articleId });
		await profileSchema.findByIdAndUpdate(
			profileId,
			{ $pull: { articles: articleId } }, // Assuming 'articles' is an array of article IDs in the user schema
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send('Failed to delete article');
	}
};

export const getArticlesPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const tag = req.query.tag;

        let filter = {};
        if (tag) {
            filter.tag = tag;
        }

        console.log(filter);

        const articles = await articleSchema.find(filter)
            .populate('user_id', 'name username image_url') // Populating relevant fields
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        // Rename user_id to user in the response
        const formattedArticles = articles.map(article => {
            const articleObj = article.toObject(); // Convert Mongoose document to plain JS object
            articleObj.user = articleObj.user_id;  // Assign user_id data to user key
            delete articleObj.user_id;             // Remove the original user_id key
            return articleObj;
        });

        const totalArticles = await articleSchema.countDocuments(filter);

        res.status(200).json({
            page,
            limit,
            totalArticles,
            totalPages: Math.ceil(totalArticles / limit),
            articles: formattedArticles,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to retrieve articles');
    }
};