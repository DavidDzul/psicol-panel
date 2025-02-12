import { fileURLToPath, URL } from "node:url"

import vue from "@vitejs/plugin-vue"
import ViteFonts from "unplugin-fonts/vite"
import { defineConfig } from "vite"
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    vuetify({
      autoImport: true,
      // styles: {
      //   configFile: "src/assets/styles/variables.scss",
      // },
    }),
    ViteFonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900",
          },
        ],
      },
    }),
  ],
  define: {
    "process.env": {
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
    // proxy: {
    //   "/api": {
    //     target: "http://127.0.0.1:8000",
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ""),
    //   },
    // }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // or "modern"
      }
    }
  }
})
