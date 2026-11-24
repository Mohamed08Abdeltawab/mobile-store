import { defineConfig, loadEnv } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverDefine = env.DATABASE_URL
    ? { "process.env.DATABASE_URL": JSON.stringify(env.DATABASE_URL) }
    : undefined;

  return {
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: {
          name: "rsc",
          childEnvironments: ["ssr"],
        },
      }),
    ],
    environments: serverDefine
      ? {
          rsc: { define: serverDefine },
          ssr: { define: serverDefine },
        }
      : undefined,
  };
});
