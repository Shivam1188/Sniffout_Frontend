import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // so dev server listens on all IPs, useful for AWS/ngrok
    port: 5173,      // optional: specify the port
    allowedHosts: ["36ba5cade7d0.ngrok-free.app", "localhost"], // whitelist your hostname(s)
  },
});
