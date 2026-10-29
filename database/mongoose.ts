import dns from 'node:dns';
import mongoose from 'mongoose';

// Ensure reliable DNS SRV/TXT resolution for MongoDB Atlas on Windows / local ISPs
// even when global c-ares has pending queries.
const atlasResolver = new dns.promises.Resolver();
atlasResolver.setServers(['8.8.8.8', '1.1.1.1']);

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    dns.promises.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
    // Global resolver may have in-flight queries; patch dns.promises methods below
}

dns.promises.resolve = atlasResolver.resolve.bind(atlasResolver) as typeof dns.promises.resolve;
dns.promises.resolveSrv = atlasResolver.resolveSrv.bind(atlasResolver);
dns.promises.resolveTxt = atlasResolver.resolveTxt.bind(atlasResolver);

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    if (!MONGODB_URI) throw new Error('MONGODB_URI must be set within .env');

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 15_000,
            connectTimeoutMS: 15_000,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    return cached.conn;
};
