import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.r2' });

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadFile(filePath, keyName) {
  try {
    const fileStream = fs.createReadStream(filePath);
    console.log(`Uploading ${filePath} to R2 bucket ${process.env.R2_BUCKET_NAME} as ${keyName}...`);
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: keyName,
      Body: fileStream,
      ContentType: "audio/mpeg",
    });

    const response = await S3.send(command);
    console.log("Upload successful!");
    
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${keyName}`;
    console.log(`Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error("Error uploading file:", err);
  }
}

// Get file from args or use default test file
const defaultPath = "I:\\music\\1)For selling\\vybezone beats\\LONELY ROAD\\LONELY ROAD tagged for streaming.mp3";
const filePath = process.argv[2] || defaultPath;
const keyName = process.argv[3] || "lonely-road-preview.mp3";

uploadFile(filePath, keyName);
