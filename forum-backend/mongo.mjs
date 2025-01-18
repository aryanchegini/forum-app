import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://aryanchegini:Ho4jCTRTBje6Od3b@cluster0.96iwq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
