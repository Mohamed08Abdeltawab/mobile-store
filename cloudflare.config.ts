import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  accountId: "6de6ee60c2f9ce44f532dcef0dfb07ff",
  worker: defineWorker({
    name: "mobile-store",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-19",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      NEXT_PUBLIC_SUPABASE_URL: bindings.secret(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: bindings.secret(),
      SUPABASE_SERVICE_ROLE_KEY: bindings.secret(),
      NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: bindings.secret(),
      ADMIN_USERNAME: bindings.secret(),
      ADMIN_PASSWORD: bindings.secret(),
      NEXT_PUBLIC_WHATSAPP_NUMBER: bindings.secret(),
      NEXT_PUBLIC_STORE_NAME: bindings.secret(),
    },
  }),
});
