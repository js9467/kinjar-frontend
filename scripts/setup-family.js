#!/usr/bin/env node

/**
 * Slaughterbeck Family Setup Script
 * Creates the admin user and family configuration for slaughterbeck.kinjar.com
 */

const API_BASE_URL = 'https://kinjar-api.fly.dev';

async function setupSlaughterbeckFamily() {
  console.log('🏠 Setting up Slaughterbeck Family...\n');

  const familyData = {
    familyName: 'Slaughterbeck',
    subdomain: 'slaughterbeck',
    description: 'The Slaughterbeck family space - sharing our journey together',
    missionStatement: 'Connecting our family through shared memories and moments',
    adminName: 'Family Admin',
    adminEmail: 'admin@slaughterbeck.family', // You can change this
    password: 'admin123', // You should change this!
    isPublic: true,
    themeColor: '#2563EB'
  };

  try {
    console.log('📝 Creating family and admin user...');
    
    const response = await fetch(`${API_BASE_URL}/families/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(familyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to create family: ${errorData.message}`);
    }

    const result = await response.json();
    
    console.log('✅ Slaughterbeck family created successfully!');
    console.log('\n📋 Setup Details:');
    console.log(`   Family Name: ${result.family.name}`);
    console.log(`   Subdomain: ${result.family.subdomain}.kinjar.com`);
    console.log(`   Admin Email: ${familyData.adminEmail}`);
    console.log(`   Admin Password: ${familyData.password}`);
    console.log(`   Family ID: ${result.family.id}`);
    
    console.log('\n🌐 Access URLs:');
    console.log(`   Production: https://${result.family.subdomain}.kinjar.com`);
    console.log(`   Development: http://localhost:3000/families/${result.family.subdomain}`);
    
    console.log('\n⚠️  Important Security Notes:');
    console.log('   1. Change the admin password immediately after first login');
    console.log('   2. Set up proper environment variables for production');
    console.log('   3. Configure your DNS to point slaughterbeck.kinjar.com to your Vercel deployment');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Deploy to Vercel with proper environment variables');
    console.log('   2. Configure subdomain DNS');
    console.log('   3. Test posting, commenting, and media uploads');
    console.log('   4. Invite family members');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 The family might already exist. Try logging in with:');
      console.log(`   Email: ${familyData.adminEmail}`);
      console.log(`   Password: ${familyData.password}`);
    }
    
    process.exit(1);
  }
}

// Alternative setup function if you want to use different credentials
async function setupCustomFamily() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  try {
    console.log('🔧 Custom Family Setup\n');
    
    const familyName = await question('Family Name: ');
    const subdomain = await question('Subdomain (will be subdomain.kinjar.com): ');
    const adminEmail = await question('Admin Email: ');
    const adminPassword = await question('Admin Password: ');
    const description = await question('Family Description (optional): ');

    const familyData = {
      familyName,
      subdomain,
      description: description || `The ${familyName} family space`,
      missionStatement: `Connecting the ${familyName} family through shared memories`,
      adminName: 'Family Admin',
      adminEmail,
      password: adminPassword,
      isPublic: true
    };

    console.log('\n📝 Creating family...');
    
    const response = await fetch(`${API_BASE_URL}/families/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(familyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to create family: ${errorData.message}`);
    }

    const result = await response.json();
    
    console.log(`\n✅ ${familyName} family created successfully!`);
    console.log(`🌐 Access at: https://${subdomain}.kinjar.com`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--custom')) {
  setupCustomFamily();
} else {
  setupSlaughterbeckFamily();
}