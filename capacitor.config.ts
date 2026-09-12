import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.maxcars.app",
  appName: "MAX CARS",
  webDir: "dist/client",
  server: {
    url: "https://max-cars-premium.chandranaidu227.chatgpt.site",
    cleartext: false,
  },
};

export default config;
