import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const devRewrites = [
  { from: /^\/catalogo$/, to: '/src/modules/catalog/presentation/catalog.html' },
  { from: /^\/produto\/.*$/, to: '/src/modules/catalog/presentation/product.html' },
  { from: /^\/carrinho$/, to: '/src/modules/cart/presentation/cart.html' },
  { from: /^\/checkout$/, to: '/src/modules/checkout/presentation/checkout.html' },
  { from: /^\/pedidos$/, to: '/src/modules/orders/presentation/orders.html' },
  { from: /^\/conta$/, to: '/src/modules/user/presentation/account.html' },
  { from: /^\/entrar$/, to: '/src/modules/user/presentation/login.html' },
  { from: /^\/cadastro$/, to: '/src/modules/user/presentation/register.html' },
  { from: /^\/entrar\/google$/, to: '/src/modules/user/presentation/google-login.html' },
  { from: /^\/cadastro\/completar$/, to: '/src/modules/user/presentation/complete-profile.html' },
];

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  server: {
    fs: { allow: ['.'] },
  },
  plugins: [
    {
      name: 'mpa-dev-rewrites',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url?.split('?')[0] ?? '';
          const match = devRewrites.find((r) => r.from.test(url));
          if (match) req.url = match.to + (req.url?.includes('?') ? '?' + req.url.split('?')[1] : '');
          next();
        });
      },
    },
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        cart: resolve(__dirname, 'src/modules/cart/presentation/cart.html'),
        catalog: resolve(__dirname, 'src/modules/catalog/presentation/catalog.html'),
        product: resolve(__dirname, 'src/modules/catalog/presentation/product.html'),
        account: resolve(__dirname, 'src/modules/user/presentation/account.html'),
        login: resolve(__dirname, 'src/modules/user/presentation/login.html'),
        register: resolve(__dirname, 'src/modules/user/presentation/register.html'),
        googleLogin: resolve(__dirname, 'src/modules/user/presentation/google-login.html'),
        completeProfile: resolve(__dirname, 'src/modules/user/presentation/complete-profile.html'),
        checkout: resolve(__dirname, 'src/modules/checkout/presentation/checkout.html'),
        orders: resolve(__dirname, 'src/modules/orders/presentation/orders.html'),
      },
    },
  },
});
