import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), '.env') });

import { db } from './server/db';
import { admins } from './shared/schema';

async function checkAdmin() {
  try {
    console.log('Checking admins in database...');
    const allAdmins = await db.select().from(admins);
    console.log('Found admins:', JSON.stringify(allAdmins, null, 2));
    
    if (allAdmins.length === 0) {
      console.log('\nNo admins found in database!');
      console.log('Creating admin user...');
      
      const [newAdmin] = await db.insert(admins).values({
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        role: 'admin',
        isActive: true
      }).returning();
      
      console.log('Admin created:', JSON.stringify(newAdmin, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAdmin();
