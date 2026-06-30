async function loadMenu(){

  const res = await fetch("http://localhost:5000/products");
  const data = await res.json();

  let grid = document.getElementById("menuGrid");
  grid.innerHTML = "";

  data.forEach(p => {
    grid.innerHTML += `
      <div class="menu-card">
        <img src="${p.image}" alt="">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <h4>Rs ${p.price}</h4>

        <button onclick="addToCart('${p.name}', '${p.price}', '${p.image}')">
          Add to Cart
        </button>
      </div>
    `;
  });
}

window.onload = loadMenu;
