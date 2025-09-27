import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

// Интерфейс для данных фильма из JSON файла
interface FilmData {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
  schedule: Array<{
    id: string;
    daytime: string;
    hall: number;
    rows: number;
    seats: number;
    price: number;
    taken: string[];
  }>;
}

async function initData(): Promise<void> {
  let client: MongoClient | null = null;

  try {
    const url = process.env.DATABASE_URL || 'mongodb://localhost:27017';
    client = new MongoClient(url);

    await client.connect();

    const db = client.db('practicum');
    const dataPath = path.join(__dirname, '../test/mongodb_initial_stub.json');

    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data file not found: ${dataPath}`);
    }

    const filmsData: FilmData[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    await db.collection('films').deleteMany({});
    await db.collection('films').insertMany(filmsData);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

initData().catch((error) => {
  console.error('Init error:', error);
  process.exit(1);
});
