// Demo data seeder script
import { db } from './db.js';
import { categories, products, admins } from '../shared/schema.js';

async function seedData() {
  console.log('Seeding demo data...');

  // Create admin user
  try {
    await db.insert(admins).values({
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      name: 'Administrator',
      role: 'admin',
      isActive: true
    });
    console.log('✓ Admin user created');
  } catch (error) {
    console.log('Admin user already exists');
  }

  // Create categories
  const categoryData = [
    {
      name: 'Elektronika',
      description: 'Telefon, kompyuter va boshqa elektronika',
      image: null,
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Kiyim-kechak',
      description: 'Erkak va ayollar kiyimlari',
      image: null,
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Kitoblar',
      description: 'O\'quv va badiiiy kitoblar',
      image: null,
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Sport',
      description: 'Sport jihozlari va aksessuarlari',
      image: null,
      isActive: true,
      sortOrder: 4
    }
  ];

  const createdCategories = [];
  for (const category of categoryData) {
    try {
      const [created] = await db.insert(categories).values(category).returning();
      createdCategories.push(created);
      console.log(`✓ Category created: ${category.name}`);
    } catch (error) {
      console.log(`Category already exists: ${category.name}`);
    }
  }

  // Create sample products
  const productData = [
    {
      name: 'iPhone 15 Pro',
      description: 'Eng yangi iPhone modeli, 128GB xotira',
      price: 12000000,
      originalPrice: 13000000,
      categoryId: createdCategories[0]?.id || 1,
      images: JSON.stringify([]),
      stock: 10,
      isActive: true,
      isFeatured: true
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Samsung\'ning flagman telefoni',
      price: 9500000,
      originalPrice: null,
      categoryId: createdCategories[0]?.id || 1,
      images: JSON.stringify([]),
      stock: 15,
      isActive: true,
      isFeatured: true
    },
    {
      name: 'Nike Air Max',
      description: 'Yugurishga mo\'ljallangan sport poyabzali',
      price: 850000,
      originalPrice: 1000000,
      categoryId: createdCategories[3]?.id || 4,
      images: JSON.stringify([]),
      stock: 20,
      isActive: true,
      isFeatured: false
    },
    {
      name: 'O\'zbek tili darslik',
      description: 'Maktab o\'quvchilari uchun o\'zbek tili darslik',
      price: 25000,
      originalPrice: null,
      categoryId: createdCategories[2]?.id || 3,
      images: JSON.stringify([]),
      stock: 50,
      isActive: true,
      isFeatured: false
    },
    {
      name: 'Futbolka',
      description: 'Pamukli erkaklar futbolkasi',
      price: 75000,
      originalPrice: 85000,
      categoryId: createdCategories[1]?.id || 2,
      images: JSON.stringify([]),
      stock: 30,
      isActive: true,
      isFeatured: true
    }
  ];

  for (const product of productData) {
    try {
      await db.insert(products).values(product);
      console.log(`✓ Product created: ${product.name}`);
    } catch (error) {
      console.log(`Product already exists: ${product.name}`);
    }
  }

  console.log('✓ Demo data seeding completed!');
  console.log('\nLogin credentials:');
  console.log('Username: admin');
  console.log('Password: admin123');
}

// Run the seeder
seedData().catch(console.error);