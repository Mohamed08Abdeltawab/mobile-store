import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const imgDir = path.join(process.cwd(), "public", "img");

async function convertAll() {
  const files = await fs.readdir(imgDir);
  const svgFiles = files.filter(f => f.endsWith(".svg"));

  console.log(`Found ${svgFiles.length} SVG files to convert to PNG.`);

  for (const svgFile of svgFiles) {
    const base = path.basename(svgFile, ".svg");
    const svgPath = path.join(imgDir, svgFile);
    const pngPath = path.join(imgDir, `${base}.png`);

    const svgBuffer = await fs.readFile(svgPath);
    await sharp(svgBuffer)
      .resize(800, 800)
      .png({ quality: 95 })
      .toFile(pngPath);

    console.log(`✓ Converted ${svgFile} -> ${base}.png`);
  }

  // Create common aliases
  const aliases = [
    { src: "iphone-16-pro-max.png", targets: ["iphone-16-pro.png", "iphone-15-pro.png", "mobile-concept-01.png"] },
    { src: "samsung-s24-ultra.png", targets: ["s24-ultra.png"] },
    { src: "apple-watch-ultra-2.png", targets: ["apple-watch-ultra.png"] },
  ];

  for (const { src, targets } of aliases) {
    const srcPath = path.join(imgDir, src);
    try {
      const buf = await fs.readFile(srcPath);
      for (const target of targets) {
        await fs.writeFile(path.join(imgDir, target), buf);
        console.log(`✓ Created alias ${target} from ${src}`);
      }
    } catch (e) {
      console.error(`Error creating alias for ${src}:`, e);
    }
  }

  console.log("All image conversions completed successfully!");
}

convertAll();
