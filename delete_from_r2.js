import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
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

// Companion to upload_to_r2.js. Pass the object keys to remove:
//   node delete_from_r2.js jazzbar-slowed.mp3 jazzbar-sped.mp3
async function main() {
  const keys = process.argv.slice(2);
  if (!keys.length) {
    console.error('Usage: node delete_from_r2.js <key> [key...]');
    process.exit(1);
  }

  for (const Key of keys) {
    const Bucket = process.env.R2_BUCKET_NAME;
    try {
      await S3.send(new HeadObjectCommand({ Bucket, Key }));
    } catch {
      console.log(`skip    ${Key} (not in bucket)`);
      continue;
    }
    await S3.send(new DeleteObjectCommand({ Bucket, Key }));
    console.log(`deleted ${Key}`);
  }
}

main();
