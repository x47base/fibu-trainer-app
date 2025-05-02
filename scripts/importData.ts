#!/usr/bin/env ts-node --loader ts-node/esm

import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { promises as fs } from 'fs';
import * as path from 'path';

interface CollectionConfig {
  name: string;
  file: string;
}

async function importData(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    const collections: CollectionConfig[] = [
      { name: 'counters', file: 'db.counters.json' },
      { name: 'tasks', file: 'db.tasks.json' },
      { name: 'users', file: 'db.users.json' }
    ];

    for (const { name, file } of collections) {
      const dataPath = path.resolve(__dirname, '../data', file);
      const content = await fs.readFile(dataPath, 'utf-8');
      const documents = JSON.parse(content) as Record<string, any>[];

      const col = db.collection(name);
      await col.deleteMany({});
      if (documents.length) {
        await col.insertMany(documents);
      }
      console.log(`Imported ${documents.length} documents into '${name}'`);
    }

  } catch (err) {
    console.error('Error importing data:', err);
  } finally {
    await client.close();
  }
}

importData();