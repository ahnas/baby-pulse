import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const newProduct = await prisma.product.create({
        data: {
            title: "Sample Product",
            price: 12,
            description: "A sample product description",
            images: {
                create: [
                    { url: "https://example.com/image1.jpg" },
                    { url: "https://example.com/image2.jpg" },
                ],
            },
        },
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });