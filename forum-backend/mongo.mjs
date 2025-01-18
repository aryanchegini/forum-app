import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();


const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function isConnectionLive() {
  try {
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

async function connectToDB() {
  if (!db || !(await isConnectionLive())) {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
    db = client.db("data");
  }
  return db;
}

export default connectToDB;
