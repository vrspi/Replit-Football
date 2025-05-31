// Simple script to test database connection
import pg from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log('Testing database connection with:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { Client } = pg;

async function testConnection() {
  // Create a client
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Connection successful!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Database time:', result.rows[0].current_time);
    
    // If we've connected to postgres database, create playhub if it doesn't exist
    if (process.env.DATABASE_URL.includes('/postgres')) {
      console.log('Connected to postgres database, checking if playhub exists...');
      
      const checkResult = await client.query("SELECT 1 FROM pg_database WHERE datname = 'playhub'");
      
      if (checkResult.rows.length === 0) {
        console.log('Creating playhub database...');
        await client.query('CREATE DATABASE playhub');
        console.log('playhub database created successfully!');
      } else {
        console.log('playhub database already exists.');
      }
    }
    
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
