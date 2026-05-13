import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userModel } from "../models/userModel.js";
import { ArticleModel } from "../models/articleModel.js";

export const adminApp = exp.Router();

// GET all authors
adminApp.get("/authors", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const authors = await userModel.find({ role: "AUTHOR" }, { password: 0 });
    res.status(200).json({ message: "authors", payload: authors });
  } catch (err) {
    next(err);
  }
});

// GET all users (admin view)
adminApp.get("/users", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const users = await userModel.find({ role: "USER" }, { password: 0 });
    res.status(200).json({ message: "users", payload: users });
  } catch (err) {
    next(err);
  }
});

// GET dashboard stats
adminApp.get("/stats", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const [totalUsers, totalAuthors, totalArticles, activeArticles] = await Promise.all([
      userModel.countDocuments({ role: "USER" }),
      userModel.countDocuments({ role: "AUTHOR" }),
      ArticleModel.countDocuments(),
      ArticleModel.countDocuments({ isArticleActive: true }),
    ]);
    res.status(200).json({
      message: "stats",
      payload: { totalUsers, totalAuthors, totalArticles, activeArticles },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH toggle author active/inactive status
adminApp.patch("/author/status", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { authorId, isUserActive } = req.body;

    // find user
    const author = await userModel.findById(authorId);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // check role
    if (author.role !== "AUTHOR") {
      return res.status(400).json({ message: "User is not an author" });
    }

    // check same state
    if (author.isUserActive === isUserActive) {
      return res.status(200).json({
        message: `Author already ${isUserActive ? "active" : "inactive"}`,
        payload: author,
      });
    }

    // update status
    author.isUserActive = isUserActive;
    await author.save();

    res.status(200).json({
      message: `Author ${isUserActive ? "activated" : "deactivated"} successfully`,
      payload: author,
    });
  } catch (err) {
    next(err);
  }
});