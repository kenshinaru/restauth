import { compare, hash } from "bcrypt"
import { getUsersCollection } from "./mongodb"
import crypto from "crypto"

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Generate API key
export function generateApiKey(): string {
  const randomPart = crypto.randomBytes(4).toString("hex").slice(0, 8)
  return `key-${randomPart}`
}

// Register new user
export async function registerUser(userData: {
  name: string
  username: string
  email: string
  password: string
}) {
  const users = await getUsersCollection()

  // Check if user already exists
  const existingUser = await users.findOne({
    $or: [{ email: userData.email }, { username: userData.username }],
  })

  if (existingUser) {
    throw new Error("User with this email or username already exists")
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password)

  // Generate API key
  const apiKey = generateApiKey()

  // Create user
  const result = await users.insertOne({
    name: userData.name,
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    role: "user",
    apiKey,
    usage: 0,
    limit: 100,
    banned: false,
    premium: false,
    expired: 0,
    createdAt: new Date(),
  })

  return {
    id: result.insertedId,
    name: userData.name,
    role: "user",
    username: userData.username,
    email: userData.email,
    apiKey,
  }
}

// Login user
export async function loginUser(credentials: { username: string; password: string }) {
  const users = await getUsersCollection()

  // Find user by username
  const user = await users.findOne({ username: credentials.username })

  if (!user) {
    throw new Error("Invalid username or password")
  }

  // Verify password
  const isPasswordValid = await verifyPassword(credentials.password, user.password)

  if (!isPasswordValid) {
    throw new Error("Invalid username or password")
  }

  return {
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    username: user.username,
    email: user.email,
    apiKey: user.apiKey,
  }
}

// Validate API key
export async function validateApiKey(apiKey: string) {
  const users = await getUsersCollection()

  const user = await users.findOne({ apiKey })

  if (!user) {
    return null
  }

  return user
}

// Increment API usage
export async function incrementApiUsage(apiKey: string) {
  const users = await getUsersCollection()

  const result = await users.updateOne({ apiKey }, { $inc: { usage: 1 } })

  return result.modifiedCount > 0
}

// Check if user has reached daily limit
export async function hasReachedDailyLimit(apiKey: string, limit = 100) {
  const users = await getUsersCollection()

  const user = await users.findOne({ apiKey })

  if (!user) {
    return true
  }

  return user.usage >= (user.limit || limit)
}
