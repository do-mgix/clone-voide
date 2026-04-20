-- Rewrite any remaining /static/products/<subfolder>/FILE.jpg imageUrls
-- to the Cloudinary path: https://res.cloudinary.com/dj6gvgvyr/image/upload/shopstore/products/FILE.jpg
UPDATE "Product"
SET "imageUrl" = regexp_replace(
  "imageUrl",
  '^/static/products/[^/]+/',
  'https://res.cloudinary.com/dj6gvgvyr/image/upload/shopstore/products/'
)
WHERE "imageUrl" LIKE '/static/products/%';
