// ===========================
// CART & CHECKOUT - script.js
// ===========================

// ===== GLOBAL addToCart FUNCTION =====
window.addToCart = function(name, price, img) {
  img = img || '';
  const priceStr = price.toString();
  const cartItem = { name: name, price: priceStr, img: img, quantity: 1 };
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push(cartItem);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showNotification('✅ ' + name + ' added to cart!');
};

// ===== CLICK HANDLER for .add-to-cart buttons =====
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  e.preventDefault();

  const card = btn.closest('.dish-card')
             || btn.closest('.product')
             || btn.closest('.menu-card')
             || btn.closest('.menu-item');

  let name  = btn.getAttribute('data-name');
  let price = btn.getAttribute('data-price');
  let img   = '';

  if (card) {
    if (!name) {
      const h3 = card.querySelector('h3');
      name = h3 ? h3.textContent.trim() : 'Item';
    }
    if (!price) {
      // Look specifically for the price element first — querySelector with a
      // comma list picks whichever matches first in DOM order, which could
      // wrongly grab the description <p> instead of the actual price.
      const priceEl = card.querySelector('.price') || card.querySelector('h4') || card.querySelector('p');
      price = priceEl ? priceEl.textContent.trim() : '0';
    }
    const imgEl = card.querySelector('img');
    img = imgEl ? imgEl.src : '';
  }

  window.addToCart(name, price, img);
});

// ===== CART COUNT =====
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
  });
}

// ===== NOTIFICATION =====
function showNotification(message) {
  let existing = document.querySelector('.cart-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    z-index: 99999;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    transform: translateX(200px);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 50);
  setTimeout(() => {
    notification.style.transform = 'translateX(200px)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 400);
  }, 2500);
}

// ===== CART PAGE: LOAD ITEMS =====
function loadCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart" style="text-align:center; padding:60px 20px; color:#94a3b8;">
        <i class="fas fa-shopping-cart" style="font-size:60px; margin-bottom:20px; opacity:0.3;"></i>
        <h3>Your cart is empty</h3>
        <a href="menu.html" style="display:inline-block; margin-top:15px; padding:12px 28px;
           background:linear-gradient(135deg,#e11d48,#be123c); color:white; border-radius:8px;
           text-decoration:none; font-weight:600;">Browse Menu</a>
      </div>`;
    updateTotal();
    return;
  }

  container.innerHTML = cart.map((item, index) => {
    const priceNum = parseInt(item.price.toString().replace(/[^0-9]/g, '')) || 0;
    const itemTotal = priceNum * item.quantity;
    return `
      <div class="cart-item" style="display:flex; align-items:center; gap:15px;
           background:rgba(30,41,59,0.8); border:1px solid #334155; border-radius:12px;
           padding:15px; margin-bottom:12px;">
        <img src="${item.img || 'https://via.placeholder.com/80'}" alt="${item.name}"
             style="width:80px; height:80px; object-fit:cover; border-radius:8px; flex-shrink:0;"
             onerror="this.src='https://via.placeholder.com/80'">
        <div style="flex:1; color:white;">
          <h4 style="margin:0 0 4px; font-size:16px;">${item.name}</h4>
          <p style="margin:0; color:#e11d48; font-weight:600;">Rs. ${priceNum} each</p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <button type="button" onclick="updateQuantity(${index}, -1)"
                  style="width:32px; height:32px; border-radius:50%; border:2px solid #475569;
                  background:transparent; color:white; font-size:18px; cursor:pointer; line-height:1;">−</button>
          <span style="color:white; font-weight:700; min-width:20px; text-align:center;">${item.quantity}</span>
          <button type="button" onclick="updateQuantity(${index}, 1)"
                  style="width:32px; height:32px; border-radius:50%; border:2px solid #475569;
                  background:transparent; color:white; font-size:18px; cursor:pointer; line-height:1;">+</button>
        </div>
        <div style="color:#10b981; font-weight:700; min-width:80px; text-align:right;">Rs. ${itemTotal}</div>
        <button type="button" onclick="removeItem(${index})"
                style="background:#ef4444; border:none; color:white; width:30px; height:30px;
                border-radius:50%; cursor:pointer; font-size:14px; flex-shrink:0;">✕</button>
      </div>`;
  }).join('');

  updateTotal();
}

// Increase/decrease quantity for the item at `index`, keeps price + totals in sync
function updateQuantity(index, change) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (!cart[index]) return;

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  loadCartItems();   // re-render items with updated price/quantity
  updateCartCount();
}
window.updateQuantity = updateQuantity;

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCartItems();
  updateCartCount();
}
window.removeItem = removeItem;

// Recalculates subtotal + delivery fee + grand total from the live cart
function updateTotal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const subtotal = cart.reduce((sum, item) => {
    const p = parseInt(item.price.toString().replace(/[^0-9]/g, '')) || 0;
    return sum + p * item.quantity;
  }, 0);
  const delivery = cart.length > 0 ? 150 : 0;
  const total = subtotal + delivery;

  const subEl = document.getElementById('subtotal');
  const totEl = document.getElementById('total');
  if (subEl) subEl.textContent = 'Rs. ' + subtotal;
  if (totEl) totEl.textContent = 'Rs. ' + total;
}

// ===== CLEAR CART BUTTON =====
document.addEventListener('click', function(e) {
  if (e.target.id === 'clearCart' || e.target.closest('#clearCart')) {
    localStorage.removeItem('cart');
    loadCartItems();
    updateCartCount();
    showNotification('🗑️ Cart cleared!');
  }
});

// ===== CHECKOUT LOGIC =====
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  loadCartItems();

  const checkoutBtn   = document.getElementById('checkoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutForm  = document.getElementById('checkoutForm');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  if (checkoutBtn && checkoutModal) {
    checkoutBtn.addEventListener('click', function() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.length === 0) {
        showNotification('⚠️ Your cart is empty!');
        return;
      }

      // Build a live order summary inside the modal (items + delivery + total)
      const subtotal = cart.reduce((sum, item) => {
        const p = parseInt(item.price.toString().replace(/[^0-9]/g, '')) || 0;
        return sum + p * item.quantity;
      }, 0);
      const delivery = 150;
      const total = subtotal + delivery;

      const modalSummaryEl = document.getElementById('modalOrderSummary');
      if (modalSummaryEl) {
        let summaryHtml = cart.map(item => {
          const p = parseInt(item.price.toString().replace(/[^0-9]/g, '')) || 0;
          return `<div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span>${item.quantity}× ${item.name}</span>
            <span>Rs. ${p * item.quantity}</span>
          </div>`;
        }).join('');
        summaryHtml += `<div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span>Delivery Fee</span><span>Rs. ${delivery}</span>
          </div>`;
        summaryHtml += `<div class="total-line"><span>Total</span><span style="color:#e11d48;">Rs. ${total}</span></div>`;
        modalSummaryEl.innerHTML = summaryHtml;
      }

      checkoutModal.style.display = 'flex';
    });
  }

  // Close modal via the X button
  if (modalCloseBtn && checkoutModal) {
    modalCloseBtn.addEventListener('click', function() {
      checkoutModal.style.display = 'none';
    });
  }

  // Close modal by clicking the dark overlay (outside the box)
  if (checkoutModal) {
    checkoutModal.addEventListener('click', function(e) {
      if (e.target === checkoutModal) {
        checkoutModal.style.display = 'none';
      }
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const name    = document.getElementById('custName').value.trim();
      const phone   = document.getElementById('custPhone').value.trim();
      const address = document.getElementById('custAddress').value.trim();

      if (!name || !phone || !address) {
        showNotification('⚠️ Please fill in all fields!');
        return;
      }

      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const subtotal = cart.reduce((sum, item) => {
        const p = parseInt(item.price.toString().replace(/[^0-9]/g, '')) || 0;
        return sum + p * item.quantity;
      }, 0);
      const total = subtotal + (cart.length > 0 ? 150 : 0);

      const orderData = { name, phone, address, items: cart, totalAmount: total };

      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
      submitBtn.disabled = true;

      try {
        // Relative URL so it works when served from the backend
        const res = await fetch('/order', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(orderData)
        });

        const data = await res.json();

        if (data.success) {
          localStorage.removeItem('cart');
          checkoutModal.style.display = 'none';
          updateCartCount();
          loadCartItems();
          checkoutForm.reset();
          showOrderSuccessPopup(orderData.name, total);
        } else {
          alert('❌ Order failed: ' + (data.message || 'Unknown error'));
        }
      } catch (err) {
        alert('❌ Cannot connect to server. Make sure http://localhost:5000 is running.');
      } finally {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      }
    });
  }
});

// ===== ORDER SUCCESS POPUP =====
function showOrderSuccessPopup(name, total) {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 999999;
    animation: fadeIn 0.4s ease;
  `;
  popup.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e293b,#0f172a); border:1px solid #10b981;
         border-radius:20px; padding:40px; text-align:center; color:white; max-width:380px; width:90%;
         animation: scaleIn 0.4s ease;">
      <div style="font-size:60px; margin-bottom:16px;">🎉</div>
      <h2 style="color:#10b981; margin:0 0 10px;">Order Placed!</h2>
      <p style="color:#94a3b8; margin:0 0 6px;">Thank you, <strong style="color:white;">${name}</strong>!</p>
      <p style="color:#94a3b8; margin:0 0 24px;">Total: <strong style="color:#e11d48;">Rs. ${total}</strong></p>
      <p style="color:#64748b; font-size:13px; margin:0 0 24px;">Your order has been saved to our database and the admin will process it shortly.</p>
      <button onclick="this.closest('[style*=fixed]').remove(); window.location.href='index.html';"
        style="background:linear-gradient(135deg,#10b981,#059669); color:white; border:none;
        padding:12px 28px; border-radius:8px; font-size:16px; font-weight:700; cursor:pointer;">
        Back to Home
      </button>
    </div>
    <style>
      @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes scaleIn { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
    </style>
  `;
  document.body.appendChild(popup);
}