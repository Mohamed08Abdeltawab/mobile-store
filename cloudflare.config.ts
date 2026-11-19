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
      BUCKET: bindings.r2({ name: process.env.R2_BUCKET_NAME || "mobile-store-images" }),
      NEXT_PUBLIC_R2_PUBLIC_URL: bindings.text(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ""),
      NEXT_PUBLIC_SUPABASE_URL: bindings.text(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: bindings.text(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""),
      SUPABASE_SERVICE_ROLE_KEY: bindings.text(process.env.SUPABASE_SERVICE_ROLE_KEY || ""),
      ADMIN_USERNAME: bindings.text(process.env.ADMIN_USERNAME || ""),
      ADMIN_PASSWORD: bindings.text(process.env.ADMIN_PASSWORD || ""),
      NEXT_PUBLIC_WHATSAPP_NUMBER: bindings.text(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""),
      NEXT_PUBLIC_STORE_NAME: bindings.text(process.env.NEXT_PUBLIC_STORE_NAME || ""),
    },
  }),
});
