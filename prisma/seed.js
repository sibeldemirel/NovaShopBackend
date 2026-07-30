const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vetements = await prisma.category.upsert({
    where: { slug: 'vetements' },
    update: {},
    create: { nom: 'Vêtements', slug: 'vetements' },
  });
  const maison = await prisma.category.upsert({
    where: { slug: 'maison' },
    update: {},
    create: { nom: 'Maison', slug: 'maison' },
  });

  const products = [
    { nom: 'T-shirt NovaShop', prix: 19.9, stock: 50, categoryId: vetements.id },
    { nom: 'Mug NovaShop', prix: 9.5, stock: 120, categoryId: maison.id },
    { nom: 'Casquette NovaShop', prix: 14.0, stock: 0, categoryId: vetements.id },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
