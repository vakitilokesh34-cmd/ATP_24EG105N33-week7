import exp from "express";
import { config } from "dotenv";
import { connect } from "mongoose";
import { userApp } from "./APIs/userAPI.js";
import { authorApp } from "./APIs/authorAPI.js";
import { adminApp } from "./APIs/adminAPI.js";
import { commonApp } from "./APIs/commonAPI.js";
import cookieParser from "cookie-parser";
import cors from 'cors'
config();

//create express app
const app = exp();
//enable cors
const allowedOrigins = [
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    // allow exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // allow any vercel.app subdomain (fallback for env var issues)
    if (origin && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('CORS: origin not allowed'));
  },
  credentials: true
}))
//add cookie parser middeleware
app.use(cookieParser())
//body parser middleware
app.use(exp.json());
//path level middlewares
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);
app.use("/auth", commonApp);

// Root route — API status page
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>BlogApp API</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:60px;background:#f5f5f5;">
        <h1 style="color:#0066cc;">BlogApp API</h1>
        <p style="color:#333;font-size:18px;">🟢 Server is running successfully!</p>
        <p style="color:#888;">Use the frontend at your Vercel URL to interact with the app.</p>
      </body>
    </html>
  `);
});

//connect to db
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB server connected");
    //assign port
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`server listening on ${port}..`));
  } catch (err) {
    console.log("err in db connect", err);
  }
};

connectDB();

//to handle invalid path
app.use((req, res, next) => {
  console.log(req.url);
  res.status(404).json({ message: `path ${req.url} is invalid` });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("error is ",err)
  console.log("Full error:", JSON.stringify(err, null, 2));
  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //send server side error
  res.status(500).json({ message: "error occurred", error: "Server side error" });
});