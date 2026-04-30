import { prisma } from '../src/lib/prisma'

async function testDatabaseConnection() {
  console.log('🔌 Testing database connection...')
  
  try {
    // Test connection by querying database version
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Database connection successful!')
    console.log('PostgreSQL Version:', result)
    
    // Test if we can create a sample user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'hashed_password_here', // In real app, use bcrypt
        role: 'student'
      }
    })
    console.log('✅ Sample user created:', { id: testUser.id, email: testUser.email })
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Test user cleaned up')
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📊 Available tables:', tables)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()