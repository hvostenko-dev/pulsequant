import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import dns from "node:dns";

// Ensure reliable DNS resolution for MongoDB Atlas SRV on Windows / local ISPs
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
    // ignore if restricted
}

const mongoUri = process.env.MONGODB_URI;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET || "pulsequant_secret_key_default_32chars_min";
const betterAuthUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
}

type MongoGlobal = typeof globalThis & {
    betterAuthMongoClient?: MongoClient;
};

const globalForMongo = globalThis as MongoGlobal;

const createMongoClient = () => {
    return new MongoClient(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 60_000,
        serverSelectionTimeoutMS: 8_000,
        connectTimeoutMS: 8_000,
    });
};

if (!globalForMongo.betterAuthMongoClient) {
    globalForMongo.betterAuthMongoClient = createMongoClient();
}

const client = globalForMongo.betterAuthMongoClient;
const db = client.db("signalist");

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
        transaction: false,
    }),

    secret: betterAuthSecret,
    baseURL: betterAuthUrl,

    trustedOrigins: [betterAuthUrl],

    emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
    },

    plugins: [nextCookies()],
});
