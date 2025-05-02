#!/usr/bin/env ts-node --loader ts-node/esm
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongodb_1 = require("mongodb");
const fs_1 = require("fs");
const path = require("path");
async function importData() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined.');
        process.exit(1);
    }
    const client = new mongodb_1.MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const collections = [
            { name: 'counters', file: 'db.counters.json' },
            { name: 'tasks', file: 'db.tasks.json' },
            { name: 'users', file: 'db.users.json' }
        ];
        for (const { name, file } of collections) {
            const dataPath = path.resolve(__dirname, '../data', file);
            const content = await fs_1.promises.readFile(dataPath, 'utf-8');
            const documents = JSON.parse(content);
            const col = db.collection(name);
            await col.deleteMany({});
            if (documents.length) {
                await col.insertMany(documents);
            }
            console.log(`Imported ${documents.length} documents into '${name}'`);
        }
    }
    catch (err) {
        console.error('Error importing data:', err);
    }
    finally {
        await client.close();
    }
}
importData();
