const fs = require('fs');
const path = require('path');

const directory = __dirname;

function replaceInFile(filePath) {
    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.json')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content
            .replace(/Bite Swift/g, 'Bite Swift')
            .replace(/bite swift/g, 'bite swift')
            .replace(/BITE SWIFT/g, 'BITE SWIFT');
            
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('images')) {
                walk(file);
            }
        } else {
            replaceInFile(file);
        }
    });
}

walk(directory);
console.log('Replacement complete.');
