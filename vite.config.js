import { defineConfig } from "vite";
import { resolve } from "node:path";

const root = import.meta.dirname;

// Site estático multi-página. O Vite serve os HTML diretamente em `npm run dev`
// e gera o build de produção com todas as páginas declaradas abaixo.
export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        servicos: resolve(root, "servicos.html"),
        sobre: resolve(root, "sobre.html"),
        blog: resolve(root, "blog.html"),
        "blog-post": resolve(root, "blog-post.html"),
        "blog-post-implante": resolve(root, "blog-post-implante.html"),
        "blog-post-infantil": resolve(root, "blog-post-infantil.html"),
        contato: resolve(root, "contato.html"),
        agendamento: resolve(root, "agendamento.html"),
        cliente: resolve(root, "cliente.html"),
        admin: resolve(root, "admin.html"),
        404: resolve(root, "404.html"),
        privacidade: resolve(root, "privacidade.html"),
      },
    },
  },
});
