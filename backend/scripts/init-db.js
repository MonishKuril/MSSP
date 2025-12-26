const knex = require('../db');
const bcrypt = require('bcrypt');
const path = require('path');
// Ensure dotenv is loaded to read from the .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function initDb() {
  try {
    console.log('Starting database initialization with correct schema...');

    // Drop tables in the correct order to avoid foreign key constraint errors
    await knex.schema.dropTableIfExists('client_admins');
    await knex.schema.dropTableIfExists('clients');
    await knex.schema.dropTableIfExists('users');
    console.log('✅ Dropped existing tables.');

    // Create users table
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').unique().notNullable();
      table.string('password').notNullable();
      table.string('role').notNullable();
      table.string('name');
      table.string('email').unique();
      table.string('organization');
      table.string('city');
      table.string('state');
      table.boolean('blocked').defaultTo(false);
      table.string('mfa_secret');
      table.timestamps(true, true);
    });
    console.log('✅ Table "users" created successfully.');

    // Create clients table
    await knex.schema.createTable('clients', (table) => {
      table.increments('id').primary();
      table.string('name').unique().notNullable();
      table.string('url').notNullable();
      table.text('description');
      table.string('graylog_host');
      table.string('graylog_username');
      table.string('graylog_password');
      table.string('graylog_stream_id');
      table.string('log_api_host');
      table.string('log_api_username');
      table.string('log_api_password');
      table.timestamps(true, true);
    });
    console.log('✅ Table "clients" created successfully (with corrected schema).');

    // Create the essential client_admins join table
    await knex.schema.createTable('client_admins', (table) => {
      table.increments('id').primary();
      table.integer('client_id').unsigned().notNullable().references('id').inTable('clients').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['client_id', 'user_id']);
    });
    console.log("✅ Table 'client_admins' created successfully.");

    // --- Seeding Data ---
    console.log('Seeding data...');
    
    // Get main superadmin credentials from .env file
    const superAdminUsername = process.env.MAIN_SUPERADMIN_USERNAME;
    const superAdminPassword = process.env.MAIN_SUPERADMIN_PASSWORD;

    if (!superAdminUsername || !superAdminPassword) {
      throw new Error('MAIN_SUPERADMIN_USERNAME and MAIN_SUPERADMIN_PASSWORD must be set in the backend/.env file.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(superAdminPassword, saltRounds);
    
    // Insert main-superadmin from .env
    const [superadminId] = await knex('users').insert({
      username: superAdminUsername,
      password: hashedPassword,
      role: 'main-superadmin',
      name: 'Main Super Admin',
      email: `${superAdminUsername}@example.com` // Generate a dummy email
    });
    console.log(`-> Main superadmin '${superAdminUsername}' created.`);

    // Insert a few dummy clients
    const [clientAId] = await knex('clients').insert({
        name: 'Client A',
        url: 'http://client-a.com/dashboard',
        description: 'Primary client for web services.',
    });

    const [clientBId] = await knex('clients').insert({
        name: 'Client B',
        url: 'http://client-b.com/dashboard',
        description: 'Secondary client for API monitoring.',
    });
    console.log('-> Dummy clients created.');

    // Correctly associate the dummy clients with the superadmin
    await knex('client_admins').insert([
        { client_id: clientAId, user_id: superadminId },
        { client_id: clientBId, user_id: superadminId }
    ]);
    console.log('-> Client-admin associations created.');


    console.log('\n🎉 Database initialization complete with the correct structure!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await knex.destroy();
  }
}

initDb();
