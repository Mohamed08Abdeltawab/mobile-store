import { bindings, defineConfig, defineWorker } from "cf/config";

const bucketName = process.env.R2_BUCKET_NAME || "mobile-store-images";
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

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
      BUCKET: bindings.r2({ name: bucketName }),
      NEXT_PUBLIC_R2_PUBLIC_URL: bindings.text(r2PublicUrl),
    },
  }),
});
