// --- Add this at the end of script.js to handle checkout ---

// Checkout Modal Logic
document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutForm = document.getElementById('checkoutForm');

  if (checkoutBtn && checkoutModal) {
    checkoutBtn.addEventListener('click', () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.length === 0) {
        showNotification("Your cart is empty!");
        return;
      }
      checkoutModal.style.display = 'flex';
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const subtotal = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/[^0-9]/g, '')) * item.quantity, 0);
      const delivery = cart.length > 0 ? 150 : 0;
      const total = subtotal + delivery;

      const orderData = {
        name: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        address: document.getElementById('custAddress').value,
        items: cart,
        totalAmount: total
      };

      checkoutForm.querySelector('button').textContent = "Placing Order...";
      
      try {
        const res = await fetch("http://localhost:5000/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        
        const data = await res.json();
        if (data.success) {
          localStorage.removeItem('cart');
          checkoutModal.style.display = 'none';
          showNotification("Order placed successfully! Thank you.");
          if (typeof loadCartItems === 'function') loadCartItems();
          if (typeof updateCartCount === 'function') updateCartCount();
        } else {
          showNotification("Failed to place order.");
        }
      } catch (err) {
        showNotification("Server error while placing order.");
      } finally {
        checkoutForm.querySelector('button').textContent = "Place Order";
      }
    });
  }
});
