const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Vytvořit testovacího uživatele
  const hashedPassword = await bcrypt.hash('test123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'user',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dní trial
      notificationSettings: {
        emailNotifications: {
          newMessages: true,
          dailyDigest: false,
          weeklyDigest: true,
          systemNotifications: true
        },
        webNotifications: {
          realTime: true,
          errors: true,
          updates: false
        }
      }
    }
  })

  console.log('Vytvořen testovací uživatel:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 