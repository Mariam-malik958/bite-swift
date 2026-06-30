const fs = require('fs');
const path = require('path');

const directory = __dirname;

// 1. Replace Mariam Hussain with Mariam Malik and add animated-footer class
function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('node_modules')) processHtmlFiles(filePath);
        } else if (filePath.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content.replace(/Mariam Hussain/g, 'Mariam Malik');
            // add class animated-footer to <footer> if it exists and doesn't have it
            newContent = newContent.replace(/<footer([^>]*)>/i, (match, p1) => {
                if (p1.includes('class=')) {
                    if (!p1.includes('animated-footer')) {
                        return `<footer${p1.replace(/class=["']([^"']*)["']/, 'class="$1 animated-footer"')}>`;
                    }
                    return match;
                } else {
                    return `<footer${p1} class="animated-footer">`;
                }
            });
            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated HTML: ${file}`);
            }
        }
    }
}
processHtmlFiles(directory);

// 2. Add animation CSS to style.css
const cssPath = path.join(directory, 'style.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('.animated-footer')) {
    cssContent += `\n
/* FOOTER ANIMATION */
@keyframes slideUpFadeIn {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
}
.animated-footer {
    animation: slideUpFadeIn 1s ease-out forwards;
}
.animated-footer:hover {
    box-shadow: 0 -5px 15px rgba(0,0,0,0.2);
    transition: box-shadow 0.3s ease;
}
`;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('Updated style.css');
}

// 3. Update script.js for the add-to-cart logic
const scriptPath = path.join(directory, 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');
// Remove old click listener
scriptContent = scriptContent.replace(/\/\/ ===== ADD TO CART - Menu\/Home Page =====[\s\S]*?\/\/ ===== CART PAGE FUNCTIONS =====/, 
`// ===== ADD TO CART - Menu/Home Page =====
window.addToCart = function(name, price, img = '') {
  const cartItem = { name, price: price.toString(), img, quantity: 1 };
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) existingItem.quantity++;
  else cart.push(cartItem);
  localStorage.setItem('cart', JSON.stringify(cart));
  if (typeof updateCartCount === 'function') updateCartCount();
  if (typeof showNotification === 'function') showNotification('Added ' + name + ' to cart!');
};

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart');
  if (btn) {
    e.preventDefault();
    const card = btn.closest('.dish-card') || btn.closest('.product') || btn.closest('.menu-card');
    let name = btn.getAttribute('data-name');
    let price = btn.getAttribute('data-price');
    let img = '';
    
    if (card) {
      if (!name) {
        const h3 = card.querySelector('h3');
        name = h3 ? h3.textContent : 'Unknown';
      }
      if (!price) {
        const p = card.querySelector('.price, h4, p');
        price = p ? p.textContent : '0';
      }
      const imgEl = card.querySelector('img');
      img = imgEl ? imgEl.src : '';
    }
    
    window.addToCart(name, price, img);
  }
});

// ===== CART PAGE FUNCTIONS =====`);
fs.writeFileSync(scriptPath, scriptContent, 'utf8');
console.log('Updated script.js');

// 4. Update menu.js to pass image
const menuJsPath = path.join(directory, 'menu.js');
if (fs.existsSync(menuJsPath)) {
    let menuContent = fs.readFileSync(menuJsPath, 'utf8');
    // Replace onclick="addToCart('${p.name}', ${p.price})" with onclick="addToCart('${p.name}', '${p.price}', '${p.image}')"
    // Also handling missing image prop if any, assuming p.image exists.
    menuContent = menuContent.replace(/onclick=["']addToCart\([^,]+,\s*[^)]+\)["']/g, (match) => {
        return `onclick="addToCart('\${p.name}', '\${p.price}', '\${p.image}')"`;
    });
    fs.writeFileSync(menuJsPath, menuContent, 'utf8');
    console.log('Updated menu.js');
}

console.log('All updates complete.');
