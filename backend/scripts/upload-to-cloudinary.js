const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dj6gvgvyr',
  api_key: '617491149525764',
  api_secret: 'YJqc9YOxuqF95f_YgWCnnjI37iU',
});

const prisma = new PrismaClient();
const IMAGES_DIR = path.join(__dirname, '../../public/products/Ropa');

async function main() {
  const products = await prisma.product.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });

  console.log(`Uploading ${products.length} images...`);
  let ok = 0, skip = 0, fail = 0;

  for (const product of products) {
    // imageUrl = "/static/products/Ropa/IMG-xxx.jpg"
    const filename = path.basename(product.imageUrl);
    const localPath = path.join(IMAGES_DIR, filename);
    const publicId = `shopstore/products/${path.parse(filename).name}`;

    if (!fs.existsSync(localPath)) {
      console.warn(`  SKIP (file not found): ${filename}`);
      skip++;
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(localPath, {
        public_id: publicId,
        overwrite: false,
        resource_type: 'image',
      });

      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: result.secure_url },
      });

      console.log(`  ✓ ${filename}`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${filename}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} uploaded, ${skip} skipped, ${fail} failed`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
