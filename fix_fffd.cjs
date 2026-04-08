const fs = require('fs');
const path = require('path');
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes('\uFFFD')) {
        content = content.replace(/\uFFFD/g, '');
        fs.writeFileSync(full, content, 'utf8');
        console.log("Cleaned " + full);
      }
    }
  }
}
walk(path.resolve(__dirname, 'src'));
