export default {
  root: "./src/",
  publicDir: "../public/",
  build: {
    outDir: "../dist/",
    emptyOutDir: true,
    reportCompressedSize: true,
  },
  server: {
    port: 3000,
    host: true,
    open: true,
  },
};
