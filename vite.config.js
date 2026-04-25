import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
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
