import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGODB_URI || ""

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env.local")
}

let client: MongoClient | undefined
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
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

export async function getUsersCollection() {
  const db = (await clientPromise).db("restauth") 
  return db.collection("users")
}

export default clientPromise 
