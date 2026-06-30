const fs = require('fs');
const path = require('path');

const directory = __dirname;

function addScriptToHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('images')) {
                addScriptToHtmlFiles(filePath);
            }
        } else if (filePath.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (!content.includes('script.js')) {
                // Insert right before </body>, or at the end if </body> not found
                if (content.includes('</body>')) {
                    content = content.replace('</body>', '  <script src="script.js"></script>\n</body>');
                } else {
                    content += '\n<script src="script.js"></script>';
                }
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Added script.js to ${file}`);
            }
        }
    }
}

addScriptToHtmlFiles(directory);
console.log('Done injecting script.js');
