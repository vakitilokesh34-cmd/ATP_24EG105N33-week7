import exp from "express";
import { userModel } from "../models/userModel.js";
import { ArticleModel } from "../models/articleModel.js";
import { hash, compare } from "bcryptjs";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken.js";
const { sign } = jwt;
export const commonApp = exp.Router();
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";
config();

// Public route — get all active articles (no auth required, used on home page)
commonApp.get("/articles", async (req, res, next) => {
  try {
    const articles = await ArticleModel.find({ isArticleActive: true })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ message: "articles", payload: articles });
  } catch (err) {
    next(err);
  }
});

// Route for register
commonApp.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
  let cloudinaryResult = null;
  try {
    let allowedRoles = ["USER", "AUTHOR"];
    // get user from req
    const newUser = req.body;
    console.log(newUser);
    console.log(req.file);

    // check role
    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Upload image to cloudinary from memoryStorage
    if (req.file) {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    }

    // add CDN link(secure_url) of image to newUserObj
    newUser.profileImageUrl = cloudinaryResult?.secure_url || "";

    // hash password and replace plain with hashed one
    newUser.password = await hash(newUser.password, 12);

    // create New user document
    const newUserDoc = new userModel(newUser);

    // save document
    await newUserDoc.save();
    // send res
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.log("err is ", err);
    // delete image from cloudinary only if it was uploaded
    if (cloudinaryResult?.public_id) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }
    next(err);
  }
});

// Route for Login (USER, AUTHOR and ADMIN)
commonApp.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // find user by email
    const user = await userModel.findOne({ email: email });
    // if user not found
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    // check if account is active
    if (!user.isUserActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Contact admin." });
    }
    // compare password
    const isMatched = await compare(password, user.password);
    // if passwords not matched
    if (!isMatched) {
      return res.status(400).json({ message: "Invalid password" });
    }
    // create jwt
    const signedToken = sign(
      {
        id: user._id,
        email: email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      },
    );

    // set token to res header as httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", signedToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    // remove password from user document
    let userObj = user.toObject();
    delete userObj.password;

    // send res
    res.status(200).json({ message: "login success", payload: userObj });
  } catch (err) {
    next(err);
  }
});

// Route for Logout
commonApp.get("/logout", (req, res) => {
  // delete token from cookie storage
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  // send res
  res.status(200).json({ message: "Logout success" });
});

// Page refresh / check auth
commonApp.get("/check-auth", verifyToken("USER", "AUTHOR", "ADMIN"), (req, res) => {
  res.status(200).json({
    message: "authenticated",
    payload: req.user,
  });
});

// Change password
commonApp.put("/password", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    // find user from DB
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check current password matches
    const isMatched = await compare(currentPassword, user.password);
    if (!isMatched) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // check new password is not same as current
    const isSame = await compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    // hash new password
    user.password = await hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
});
