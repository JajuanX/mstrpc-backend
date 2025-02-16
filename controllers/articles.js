import mongoose from 'mongoose';
import articleSchema from '../models/article.js';
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
    try {
        const { tag } = req.body; // Assuming a single tag is passed

        const response = await articleSchema.create(req.body);

        if (tag) {
            await tagsSchema.updateOne(
                { tag },
                { $inc: { count: 1 } }, 
                { upsert: true, setDefaultsOnInsert: true } 
            );			
        }

        res.status(200).json(response);
    } catch (err) {
        console.error(err);
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

    try {
        const existingArticle = await articleSchema.findById(id);
        if (!existingArticle) {
            return res.status(404).json({ message: "Article not found" });
        }

        const oldTag = existingArticle.tag;
        const newTag = updatedData.tag;

        // Update the article
        const updatedArticle = await articleSchema.findByIdAndUpdate(id, updatedData, { new: true });

        // Update tag counts if the tag has changed
        if (oldTag !== newTag) {
            if (oldTag) {
                await tagsSchema.updateOne(
                    { tag: oldTag },
                    { $inc: { count: -1 } }
                );
            }
            if (newTag) {
                await tagsSchema.updateOne(
                    { tag: newTag },
                    { $inc: { count: 1 } },
                    { upsert: true, setDefaultsOnInsert: true }
                );
            }
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

        if (id.toString() !== profileId) {
            return res.status(400).send('Not your profile');
        }

        const response = await articleSchema.deleteOne({ _id: articleId });

        if (article.tag) {
            await tagsSchema.updateOne(
                { tag: article.tag },
                { $inc: { count: -1 } }
            );
        }

        return res.status(200).json(response);
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

        const articles = await articleSchema.find(filter)
            .populate('user_id', 'name username image_url') // Populating relevant fields
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

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