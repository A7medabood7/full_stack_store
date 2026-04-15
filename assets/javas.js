

let products = [];


let cart = [];
let selectedProduct = null;


const grid = document.getElementById('productsGrid');
const toast = document.getElementById('toast');
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const qtyModal = document.getElementById('qtyModal');
const qtyInput = document.getElementById('qtyInput');
const addToCartBtn = document.getElementById('addToCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const backTop = document.getElementById('backTop');
const loader = document.getElementById('loader');
const welcomeText = document.getElementById('welcomeText');


function fmt(n){ return n.toLocaleString() + ' ريال سعودي'; }


function renderProducts(filter='all'){
  grid.innerHTML='';
  const list = products.filter(p => filter==='all' ? true : p.type===filter);
  list.forEach(p => {
    const card = document.createElement('article');
    card.className='card';
    card.innerHTML = `
      <div class="img" aria-hidden="true">
        <div style="text-align:center">
          <div style="font-size:14px;color:var(--muted);font-weight:700">صورة مؤقتة</div>
          <div style="font-size:12px;color:var(--muted)">${p.name}</div>
        </div>
      </div>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="meta">النوع: ${p.type === 'male' ? 'رجالي' : 'نسائي'}</div>
      <div class="buy-row">
        <div class="price">${fmt(p.price)}</div>
        <button class="buy-btn" data-id="${p.id}">اشتري الآن</button>
      </div>
    `;
    grid.appendChild(card);
  });
}


function openQtyModal(prodId){
selectedProduct = products.find(x => Number(x.id) === prodId);
  document.getElementById('modalTitle').textContent = selectedProduct.name;
  document.getElementById('modalDesc').textContent = selectedProduct.description;
  qtyInput.value = 1;
  qtyModal.classList.add('show');
  qtyModal.setAttribute('aria-hidden','false');
  qtyModal.style.display='flex';
  setTimeout(()=> qtyModal.classList.add('show'), 10);
}
function closeQtyModal(){
  qtyModal.classList.remove('show');
  qtyModal.setAttribute('aria-hidden','true');
  setTimeout(()=> qtyModal.style.display='none', 220);
}


function addToCart(product, qty){
  const existing = cart.find(i=>i.id===product.id);
  if(existing){
    existing.qty += qty;
  } else {
    cart.push({id:product.id,name:product.name,type:product.type,price:product.price,qty:qty});
  }
  updateCartUI();
  showToast('تمت الإضافة إلى السلة');
  
  const btn = document.querySelector('.cart-btn');
  btn.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:420});
}


function showToast(txt){
  toast.textContent = txt;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 1800);
}


function updateCartUI(){
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartItems.innerHTML = '';
  cart.forEach(it=>{
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="mini">صورة</div>
      <div class="info">
        <b>${it.name}</b>
        <div style="font-size:13px;color:var(--muted)">${it.type === 'male' ? 'رجالي' : 'نسائي'}</div>
      </div>
      <div style="text-align:center">
        <div class="qty-num">${it.qty} × ${it.price}</div>
        <div style="margin-top:6px"><button data-id="${it.id}" class="remove" style="background:transparent;border:1px solid rgba(255,255,255,0.04);padding:6px;border-radius:6px;color:var(--muted);cursor:pointer">إزالة</button></div>
      </div>
    `;
    cartItems.appendChild(el);
  });
  const total = cart.reduce((s,i)=>s + (i.qty * i.price),0);
  cartTotal.textContent = 'الإجمالي: ' + total.toLocaleString() + ' ريال';
}


document.addEventListener('click', e=>{
  if(e.target.matches('.buy-btn')){
    const id = Number(e.target.dataset.id);
    openQtyModal(id);
  } else if(e.target.id === 'openCart'){
    cartPanel.classList.add('open');
    cartPanel.setAttribute('aria-hidden','false');
  } else if(e.target.id === 'closeCart'){
    cartPanel.classList.remove('open');
    cartPanel.setAttribute('aria-hidden','true');
  } else if(e.target.matches('.remove')){
    const id = Number(e.target.dataset.id);
    cart = cart.filter(x=>x.id !== id);
    updateCartUI();
  }
});


addToCartBtn.addEventListener('click', ()=>{
  const q = Math.max(1, Number(qtyInput.value));
  addToCart(selectedProduct, q);
  closeQtyModal();

fetch("APIs/add_to_cart.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `product_id=${selectedProduct.id}&quantity=${q}`
  })
  .then(res => res.json())
  .then(data => {
    console.log("Server response:", data);
  })
  .catch(err => {
    console.error("Error:", err);
  });




});


checkoutBtn.addEventListener('click', ()=>{
  if(cart.length === 0){
    showToast('السلة فارغة');
    return;
  }
  fetch("APIs/checkout.php", {
    method: "POST"
  })
  .then(res => res.json())
  .then(data => {

    console.log(data);

    if(data.status === "success"){

      return fetch("APIs/get_cart.php");
    } else {
      throw new Error(data.message);
    }

  })
  .then(res => res.json())
  .then(data => {

    cart = data.map(item => ({
      id: Number(item.product_id),
      name: item.name,
      price: Number(item.price),
      type: item.type,
      qty: Number(item.quantity)
    }));

    updateCartUI();
    cartPanel.classList.remove('open');
    showToast('تم إتمام الطلب بنجاح ✔️');

  })
  .catch(err => {
    console.error(err);
    showToast('حدث خطأ ❌');
  });
});


document.getElementById('showAll').addEventListener('click', ()=>renderProducts('all'));
document.getElementById('showMale').addEventListener('click', ()=>renderProducts('male'));
document.getElementById('showFemale').addEventListener('click', ()=>renderProducts('female'));


backTop.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));


qtyModal.addEventListener('click', (e)=>{
  if(e.target === qtyModal) closeQtyModal();
});

updateCartUI();

fetch("APIs/products.php")
  .then(response => response.json())
  .then(data => {
    products = data;
    renderProducts();  
  })
  .catch(error => {
    console.error("Error:", error);
  });

document.getElementById('year').textContent = new Date().getFullYear();


setTimeout(()=>{ welcomeText.style.opacity=1; welcomeText.style.transform='none'; }, 700);


window.addEventListener('load', ()=>{
  setTimeout(()=> {
    loader.style.opacity=0;
    loader.style.pointerEvents='none';
    setTimeout(()=> loader.style.display='none',400);
  }, 900);
});


document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    cartPanel.classList.remove('open');
    closeQtyModal();
  }
});
