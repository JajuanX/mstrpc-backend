import mongoose from 'mongoose';
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
        const article = await articleSchema.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const editArticle = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
	console.log('===========',id);
	
    try {
        const updatedArticle = await articleSchema.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedArticle) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.json(updatedArticle);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ message: 'Server error' });
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
        const article = await articleSchema.findOne({ _id: articleId }).exec();
        if (!article) {
            return res.status(404).send('Article not found');
        }

        const id = new mongoose.Types.ObjectId(article.user_id);

        if (id.toString() === profileId) {
            const response = await articleSchema.deleteOne({ _id: articleId }); // Use articleId here, not id
            return res.status(200).json(response);
        }

        // If profileId doesn't match
        return res.status(400).send('Not your profile');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Failed to delete article');
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