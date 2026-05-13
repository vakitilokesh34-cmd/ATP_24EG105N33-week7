import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const frontendSrcDir = 'd:\\Halt\\blogApp\\Frontend\\src';
const files = walkDir(frontendSrcDir);

let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:4000')) {
        // Replace string interpolation or string concatenation cases
        content = content.replace(/"http:\/\/localhost:4000/g, 'import.meta.env.VITE_API_URL + "');
        content = content.replace(/'http:\/\/localhost:4000/g, "import.meta.env.VITE_API_URL + '");
        content = content.replace(/`http:\/\/localhost:4000/g, "`\\${import.meta.env.VITE_API_URL}");
        fs.writeFileSync(file, content);
        console.log('Updated', file);
        count++;
    }
});
console.log(`Replaced in ${count} files.`);
