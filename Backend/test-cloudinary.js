import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinary() {
  try {
    const res = await cloudinary.api.ping();
    console.log("Cloudinary Ping Success:", res);
  } catch (err) {
    console.error("Cloudinary Ping Failed:", err);
  }
}

testCloudinary();
