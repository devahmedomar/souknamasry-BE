import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTextIndexes() {
  try {
    await mongoose.connect(process.env.DATABASE_URI!);
    console.log('Connected to MongoDB');

    // Drop existing text index if any
    try {
      await Product.collection.dropIndex('product_text_search');
      console.log('Dropped old text index');
    } catch (error) {
      console.log('No existing text index to drop');
    }

    // Create new text index
    await Product.collection.createIndex(
      { name: 'text', nameAr: 'text', description: 'text' },
      {
        weights: { name: 10, nameAr: 10, description: 3 },
        name: 'product_text_search',
        default_language: 'english'
      }
    );
    console.log('✓ Text index created successfully');

    // Verify index creation
    const indexes = await Product.collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating text indexes:', error);
    process.exit(1);
  }
}

createTextIndexes();
