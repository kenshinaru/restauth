import { MongoClient, ServerApiVersion, type Db } from "mongodb"

const uri = process.env.MONGODB_URI || ""

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env.local")
}

let client: MongoClient | undefined
let clientPromise: Promise<MongoClient>
let cachedDb: Db | null = null // Cache for database instance

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the client is not recreated on every hot reload
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })
  clientPromise = client.connect()
}

export async function connectToDatabase() {
  return clientPromise
}

export async function getDatabase() {
  if (cachedDb) return cachedDb

  const client = await clientPromise
  const db = client.db("restauth") // Assuming your database name is 'restauth'
  cachedDb = db
  return db
}

export async function getUsersCollection() {
  const db = await getDatabase()
  return db.collection("users")
}

export default clientPromise 
