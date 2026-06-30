const fs = require('fs');
const path = require('path');

const directory = __dirname;

// 1. Fix menu.js by removing the syntax error at the end
const menuJsPath = path.join(directory, 'menu.js');
if (fs.existsSync(menuJsPath)) {
    let menuContent = fs.readFileSync(menuJsPath, 'utf8');
    // Find window.onload = loadMenu; and cut everything after it
    const cutIndex = menuContent.indexOf('window.onload = loadMenu;');
    if (cutIndex !== -1) {
        menuContent = menuContent.substring(0, cutIndex + 'window.onload = loadMenu;'.length) + '\n';
        fs.writeFileSync(menuJsPath, menuContent, 'utf8');
        console.log('Fixed menu.js syntax error');
    }
}

// 2. Add <span class="cart-count">0</span> to the Cart link in all HTML files
function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('images')) {
                processHtmlFiles(filePath);
            }
        } else if (filePath.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Check if cart-count already exists
            if (!content.includes('class="cart-count"')) {
                // Find <li><a href="Cart.html">Cart</a></li> or similar
                // We'll replace Cart</a> with Cart <span class="cart-count">0</span></a>
                content = content.replace(
                    /(<a[^>]*href=["']Cart\.html["'][^>]*>.*?(?:Cart).*?)(<\/a>)/gi, 
                    '$1 <span class="cart-count">0</span>$2'
                );
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Added cart-count to ${file}`);
            }
        }
    }
}

processHtmlFiles(directory);

// 3. Add styling for cart-count in style.css so it looks nice
const cssPath = path.join(directory, 'style.css');
if (fs.existsSync(cssPath)) {
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    if (!cssContent.includes('.cart-count')) {
        cssContent += `\n
/* CART COUNT BADGE */
.cart-count {
    background: red;
    color: white;
    border-radius: 50%;
    padding: 2px 8px;
    font-size: 14px;
    margin-left: 5px;
    font-weight: bold;
}
`;
        fs.writeFileSync(cssPath, cssContent, 'utf8');
        console.log('Added .cart-count CSS to style.css');
    }
}

console.log('All cart fixes complete.');
