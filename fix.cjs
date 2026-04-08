const fs = require("fs");
const path = require("path");

const BAD_CHARS = ["á»", "áº", "Ã", "Ä", "Â·", "â"];

function fixDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      fixDir(fullPath);
    } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf8");
      
      const isCorrupt = BAD_CHARS.some(c => content.includes(c));
      if (isCorrupt) {
        try {
          const restored = Buffer.from(content, "latin1").toString("utf8");
          // Double check if there are null characters indicating data loss
          if (restored.includes("\u0000") && !content.includes("\u0000")) {
            console.log("Skipping due to potential data loss: " + fullPath);
            continue;
          }
          fs.writeFileSync(fullPath, restored, "utf8");
          console.log("Fixed: " + fullPath);
        } catch (e) {
          console.log("Error fixing " + fullPath, e.message);
        }
      }
    }
  }
}

fixDir(path.resolve(__dirname, "src"));
