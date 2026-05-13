import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { ArticleModel } from "../models/articleModel.js";
export const userApp = exp.Router();

// Read articles of all authors
userApp.get("/articles", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    // read articles
    const articlesList = await ArticleModel.find({ isArticleActive: true }).sort({ createdAt: -1 });
    // send res
    res.status(200).json({ message: "articles", payload: articlesList });
  } catch (err) {
    next(err);
  }
});

// Read a single article by ID (used when navigating directly to /article/:id)
userApp.get("/article/:id", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await ArticleModel.findOne({ _id: id, isArticleActive: true }).populate(
      "comments.user",
      "firstName lastName email",
    );
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ message: "article", payload: article });
  } catch (err) {
    next(err);
  }
});

// Add comment to an article (one comment per user per article)
userApp.put("/articles", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId, comment } = req.body;
    const userId = req.user?.id;

    const articleDocument = await ArticleModel.findOne({
      _id: articleId,
      isArticleActive: true,
    }).populate("comments.user", "firstName lastName email");

    if (!articleDocument) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if user already commented
    const alreadyCommented = articleDocument.comments.some(
      (c) => c.user?._id?.toString() === userId || c.user?.toString() === userId
    );
    if (alreadyCommented) {
      return res.status(409).json({ message: "You have already commented on this article. Edit your existing comment instead." });
    }

    articleDocument.comments.push({ user: userId, comment: comment });
    await articleDocument.save();
    await articleDocument.populate("comments.user", "firstName lastName email");

    res.status(200).json({ message: "Comment added successfully", payload: articleDocument });
  } catch (err) {
    next(err);
  }
});

// Edit own comment
userApp.patch("/articles/comment/edit", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId, commentId, comment } = req.body;
    const userId = req.user?.id;

    const articleDocument = await ArticleModel.findOne({ _id: articleId, isArticleActive: true });
    if (!articleDocument) return res.status(404).json({ message: "Article not found" });

    const commentObj = articleDocument.comments.id(commentId);
    if (!commentObj) return res.status(404).json({ message: "Comment not found" });

    // user field may be ObjectId or populated object
    const commentUserId = commentObj.user?._id?.toString() || commentObj.user?.toString();
    if (commentUserId !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    commentObj.comment = comment;
    await articleDocument.save();
    // Re-fetch from DB to ensure fully populated response
    const updatedArticle = await ArticleModel.findById(articleId).populate("comments.user", "firstName lastName email");
    res.status(200).json({ message: "Comment updated", payload: updatedArticle });
  } catch (err) {
    next(err);
  }
});

// Delete own comment
userApp.delete("/articles/comment/delete", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId, commentId } = req.body;
    const userId = req.user?.id;

    const articleDocument = await ArticleModel.findOne({ _id: articleId, isArticleActive: true });
    if (!articleDocument) return res.status(404).json({ message: "Article not found" });

    const commentObj = articleDocument.comments.id(commentId);
    if (!commentObj) return res.status(404).json({ message: "Comment not found" });

    // user field may be ObjectId or populated object
    const commentUserId = commentObj.user?._id?.toString() || commentObj.user?.toString();
    if (commentUserId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    commentObj.deleteOne();
    await articleDocument.save();
    // Re-fetch from DB to ensure fully populated response
    const updatedArticle = await ArticleModel.findById(articleId).populate("comments.user", "firstName lastName email");
    res.status(200).json({ message: "Comment deleted", payload: updatedArticle });
  } catch (err) {
    next(err);
  }
});
