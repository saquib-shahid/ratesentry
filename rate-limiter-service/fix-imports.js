import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
};

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // regex to replace import X from './something' to './something.js'
    // careful to only append .js if it does not already end with .js and is a local file
    content = content.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
        if (!p1.endsWith('.js')) {
            return `from '${p1}.js'`;
        }
        return match;
    });
    fs.writeFileSync(file, content);
});

console.log('Fixed imports!');
