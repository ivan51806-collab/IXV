// IXV Landscape Design — shared site behavior
// NOTE: quote/consultation form submission is not yet wired to a real email
// service. Swap the TODO in handleFormSubmit() once Formspree/Web3Forms (or
// another backend) is chosen.

const CART_KEY = 'ixv_quote_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) { /* storage unavailable, ignore */ }
  renderCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  if (cart.some((i) => i.id === item.id)) {
    openCart();
    return;
  }
  cart.push(item);
  saveCart(cart);
  renderCartDrawer();
  openCart();
}

function removeFromCart(id) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  renderCartDrawer();
}

function renderCartBadge() {
  const count = getCart().length;
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = count;
    el.classList.toggle('hidden', count === 0);
  });
}

function renderCartDrawer() {
  const list = document.getElementById('cart-drawer-items');
  if (!list) return;
  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = '<p class="cart-empty">Your quote list is empty.<br>Browse Services or Products and tap "Add to Quote."</p>';
    return;
  }
  list.innerHTML = cart.map((item) => `
    <div class="cart-line">
      <div class="thumb">${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="placeholder-tile" style="font-size:0.5rem;">No Photo</div>'}</div>
      <div class="info">
        <h5>${item.name}</h5>
        <span>${item.category || ''}</span>
      </div>
      <button class="remove" data-remove="${item.id}" aria-label="Remove">&times;</button>
    </div>
  `).join('');
  list.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
}

function renderCartPage() {
  const list = document.getElementById('cart-page-items');
  const empty = document.getElementById('cart-page-empty');
  const formWrap = document.getElementById('cart-page-form-wrap');
  if (!list) return;
  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (formWrap) formWrap.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (formWrap) formWrap.style.display = '';
  list.innerHTML = cart.map((item) => `
    <div class="cart-line" style="padding:16px; background:var(--charcoal); border-radius:8px;">
      <div class="thumb">${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="placeholder-tile" style="font-size:0.5rem;">No Photo</div>'}</div>
      <div class="info">
        <h5>${item.name}</h5>
        <span>${item.category || ''}</span>
      </div>
      <button class="remove" data-remove-page="${item.id}" aria-label="Remove" style="font-size:1.4rem;">&times;</button>
    </div>
  `).join('');
  list.querySelectorAll('[data-remove-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.removePage);
      renderCartPage();
    });
  });
}

function openCart() {
  const overlay = document.getElementById('cart-overlay');
  if (overlay) overlay.classList.add('open');
}
function closeCart() {
  const overlay = document.getElementById('cart-overlay');
  if (overlay) overlay.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge();
  renderCartDrawer();
  renderCartPage();

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Dropdown toggles (click-based, works for touch + desktop)
  document.querySelectorAll('.nav-links > li').forEach((li) => {
    const trigger = li.querySelector('button.nav-link');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = li.classList.contains('open');
      document.querySelectorAll('.nav-links > li.open').forEach((el) => el.classList.remove('open'));
      if (!wasOpen) li.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-links > li.open').forEach((el) => el.classList.remove('open'));
  });

  // Add to Quote buttons — data-id, data-name, data-category, data-image
  document.querySelectorAll('[data-add-to-quote]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        category: btn.dataset.category || '',
        image: btn.dataset.image || '',
      });
    });
  });

  // Cart open/close
  document.querySelectorAll('[data-cart-open]').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  });
  const overlay = document.getElementById('cart-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCart(); });
  }
  document.querySelectorAll('[data-cart-close]').forEach((btn) => {
    btn.addEventListener('click', closeCart);
  });

  // Consultation / quote forms — client-side only for now
  document.querySelectorAll('form[data-quote-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: replace with a real submit to Formspree/Web3Forms once chosen.
      // Currently just confirms locally and clears the cart if this was the
      // quote-cart checkout form.
      const successEl = form.parentElement.querySelector('.form-success') || document.getElementById('form-success');
      if (successEl) {
        successEl.classList.add('show');
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (form.dataset.quoteForm === 'cart') {
        saveCart([]);
        renderCartDrawer();
        renderCartPage();
      }
      form.reset();
    });
  });

  // Sticky header shadow on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.4)' : 'none';
    });
  }
});
