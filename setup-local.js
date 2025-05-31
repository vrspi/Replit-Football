// Local development setup script
import { exec, execSync } from 'child_process';
import pg from 'pg';
const { Client } = pg;
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL bin directory
const PG_BIN_PATH = 'D:\\PostgreSQL\\17\\bin';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default connection settings
let config = {
  host: 'localhost',
  port: 5430,
  user: 'postgres',
  password: '',
  database: 'postgres' // Default database to connect to first
};

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupDatabase() {
  console.log('PlayHub Local Setup');
  console.log('===================');
  console.log(`Using PostgreSQL from: ${PG_BIN_PATH}`);
  
  // Get PostgreSQL connection details
  console.log('\nPlease enter your PostgreSQL connection details:');
  
  const defaultHost = config.host;
  const hostInput = await prompt(`Host (default: ${defaultHost}): `);
  config.host = hostInput || defaultHost;
  
  const defaultPort = config.port;
  const portInput = await prompt(`Port (default: ${defaultPort}): `);
  config.port = portInput || defaultPort;
  
  const defaultUser = config.user;
  const userInput = await prompt(`Username (default: ${defaultUser}): `);
  config.user = userInput || defaultUser;
  
  config.password = await prompt('Password: ');
  
  // Create a connection string for commands
  const pgConnString = `-h ${config.host} -p ${config.port} -U ${config.user}`;
  
  try {
    console.log('\nTesting PostgreSQL connection...');
    
    // Check PostgreSQL connection by listing databases
    try {
      // Using execSync to run the command and capture output
      // Set PGPASSWORD environment variable for password
      const env = { ...process.env, PGPASSWORD: config.password };
      execSync(`"${path.join(PG_BIN_PATH, 'psql')}" ${pgConnString} -c "SELECT version()" -d postgres`, { env });
      console.log('Connected to PostgreSQL server successfully.');
    } catch (err) {
      console.error('Failed to connect to PostgreSQL:', err.message);
      rl.close();
      return;
    }
    
    // Check if playhub database exists
    console.log('\nChecking if playhub database exists...');
    try {
      const env = { ...process.env, PGPASSWORD: config.password };
      execSync(`"${path.join(PG_BIN_PATH, 'psql')}" ${pgConnString} -c "SELECT 1 FROM pg_database WHERE datname = 'playhub'" -d postgres`, { env });
      console.log('The playhub database already exists.');
    } catch (err) {
      // Database doesn't exist or query failed, create the database
      console.log('\nCreating playhub database...');
      try {
        const env = { ...process.env, PGPASSWORD: config.password };
        execSync(`"${path.join(PG_BIN_PATH, 'psql')}" ${pgConnString} -c "CREATE DATABASE playhub" -d postgres`, { env });
        console.log('Database created successfully.');
      } catch (createErr) {
        console.error('Failed to create database:', createErr.message);
        rl.close();
        return;
      }
    }
    
    // Update .env file
    const envContent = `DATABASE_URL=postgres://${config.user}:${config.password}@${config.host}:${config.port}/playhub
JWT_SECRET=local_development_secret_key
NODE_ENV=development`;
    
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('\n.env file created with your database configuration.');
    
    // Run database migrations
    console.log('\nRunning database migrations...');
    exec('npm run db:push', (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Migration stderr: ${stderr}`);
        return;
      }
      
      console.log(stdout);
      console.log('\nDatabase setup completed successfully!');
      console.log('\nYou can now run the application with:');
      console.log('npm run dev');
      
      rl.close();
    });
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
    rl.close();
  }
}
setupDatabase();
