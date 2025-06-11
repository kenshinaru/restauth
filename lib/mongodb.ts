// lib/mongodb.ts
import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI!
const dbName = "arincy"

if (!uri) throw new Error("Please define MONGODB_URI in your environment variables")

const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>
let cachedDb: Db | null = null

declare global {
  var _mongoClientPromise: Promise<MongoClient>
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Helper function to get database connection
export async function getDatabase() {
  if (cachedDb) return cachedDb

  const client = await clientPromise
  const db = client.db(dbName)
  cachedDb = db
  return db
}

// Helper function to get users collection
export async function getUsersCollection() {
  const db = await getDatabase()
  return db.collection("users")
}
