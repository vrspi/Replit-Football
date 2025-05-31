// Simple script to create the database
import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

// Parse the DATABASE_URL to get the connection details
const url = new URL(process.env.DATABASE_URL);
const config = {
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: 'postgres' // Connect to default database first
};

async function createDatabase() {
  const client = new Client(config);
  
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully.');
    
    // Check if database exists
    const checkResult = await client.query("SELECT 1 FROM pg_database WHERE datname = 'playhub'");
    
    if (checkResult.rows.length === 0) {
      console.log('Creating playhub database...');
      await client.query('CREATE DATABASE playhub');
      console.log('Database created successfully!');
    } else {
      console.log('The playhub database already exists.');
    }
    
    // Update the .env file to use the playhub database
    console.log('Updating DATABASE_URL to use playhub database');
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    let envContent = await fs.promises.readFile(path.join(__dirname, '.env'), 'utf8');
    // Replace the database name in the connection string
    envContent = envContent.replace(
      /DATABASE_URL=postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^\/\n]+)/,
      `DATABASE_URL=postgres://$1:$2@$3:$4/playhub`
    );
    
    await fs.promises.writeFile(path.join(__dirname, '.env'), envContent);
    console.log('.env file updated with playhub database');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createDatabase();
