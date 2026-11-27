import { defineConfig, loadEnv } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverDefine: Record<string, string> = {};
  const serverKeys = [
    "DATABASE_URL",
    "ADMIN_USERNAME",
    "ADMIN_PASSWORD",
    "R2_BUCKET_NAME",
    "NEXT_PUBLIC_R2_PUBLIC_URL",
  ];

  for (const key of serverKeys) {
    if (env[key]) {
      serverDefine[`process.env.${key}`] = JSON.stringify(env[key]);
    }
  }

  const hasDefines = Object.keys(serverDefine).length > 0;

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
    environments: hasDefines
      ? {
          rsc: { define: serverDefine },
          ssr: { define: serverDefine },
        }
      : undefined,
  };
});
