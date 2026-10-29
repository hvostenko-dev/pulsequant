import dns from "node:dns";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

// Ensure reliable DNS SRV/TXT resolution for MongoDB Atlas on Windows / local ISPs
// even when global c-ares has pending queries.
const atlasResolver = new dns.promises.Resolver();
atlasResolver.setServers(["8.8.8.8", "1.1.1.1"]);

try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    dns.promises.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
    // Global resolver may have in-flight queries; patch dns.promises methods below
}

dns.promises.resolve = atlasResolver.resolve.bind(atlasResolver) as typeof dns.promises.resolve;
dns.promises.resolveSrv = atlasResolver.resolveSrv.bind(atlasResolver);
dns.promises.resolveTxt = atlasResolver.resolveTxt.bind(atlasResolver);

const mongoUri = process.env.MONGODB_URI;
const betterAuthSecret =
    process.env.BETTER_AUTH_SECRET || "pulsequant_secret_key_default_32chars_min";
const betterAuthUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
}

type MongoGlobal = typeof globalThis & {
    betterAuthMongoClient?: MongoClient;
    betterAuthMongoPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

const createMongoClient = () => {
    return new MongoClient(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 60_000,
        serverSelectionTimeoutMS: 15_000,
        connectTimeoutMS: 15_000,
    });
};

if (!globalForMongo.betterAuthMongoClient) {
    globalForMongo.betterAuthMongoClient = createMongoClient();
}

const client = globalForMongo.betterAuthMongoClient;

if (!globalForMongo.betterAuthMongoPromise) {
    globalForMongo.betterAuthMongoPromise = client
        .connect()
        .catch((error) => {
            globalForMongo.betterAuthMongoClient = undefined;
            globalForMongo.betterAuthMongoPromise = undefined;
            throw error;
        });
}

await globalForMongo.betterAuthMongoPromise;

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
