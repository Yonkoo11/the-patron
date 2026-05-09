import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";

const start = async () => {
  const entry = path.resolve("./src/index.ts");

  console.log("Bundling...");
  const bundleLocation = await bundle({
    entryPoint: entry,
  });

  console.log("Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ThePatron",
  });

  console.log("Rendering...");
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: path.resolve("./out/ThePatron.mp4"),
  });

  console.log("Done! Output: ./out/ThePatron.mp4");
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
