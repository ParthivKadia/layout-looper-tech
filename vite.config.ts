import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    // Vercel is the default deployment target. Docker builds override this
    // with NITRO_PRESET=node-server so output is written to .output/.
    preset: process.env.NITRO_PRESET ?? "vercel",
  },
});
