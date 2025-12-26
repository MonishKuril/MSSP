const knex = require('../db');

async function fixSchema() {
  console.log('Starting database schema check and fix...');
  try {
    // 1. Check for and create the 'client_admins' table
    const hasClientAdminsTable = await knex.schema.hasTable('client_admins');
    if (!hasClientAdminsTable) {
      console.log("Table 'client_admins' not found. Creating it now...");
      await knex.schema.createTable('client_admins', (table) => {
        table.increments('id').primary();
        table.integer('client_id').unsigned().notNullable().references('id').inTable('clients').onDelete('CASCADE');
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.timestamps(true, true);
        // Ensure a client can't be assigned to the same admin more than once
        table.unique(['client_id', 'user_id']);
      });
      console.log("✅ Table 'client_admins' created successfully.");
    } else {
      console.log("✅ Table 'client_admins' already exists. No action needed.");
    }

    // 2. Check for and drop the legacy 'admin_id' column from the 'clients' table
    const hasAdminIdColumn = await knex.schema.hasColumn('clients', 'admin_id');
    if (hasAdminIdColumn) {
      console.log("Legacy column 'admin_id' found in 'clients' table. Removing it now...");
      await knex.schema.alterTable('clients', (table) => {
        table.dropColumn('admin_id');
      });
      console.log("✅ Legacy column 'admin_id' removed successfully.");
    } else {
      console.log("✅ Legacy column 'admin_id' not found. No action needed.");
    }

    console.log('\nDatabase schema fix complete!');

  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  } finally {
    await knex.destroy();
  }
}

fixSchema();
