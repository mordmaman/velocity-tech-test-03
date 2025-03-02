// Collection page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Product card quantity selectors
    setupQuantitySelectors();
    
    // Wishlist functionality
    setupWishlistButtons();
    
    // Cart drawer functionality
    setupCartDrawer();
  });
  
  function setupQuantitySelectors() {
    const decreaseButtons = document.querySelectorAll('.product-card__quantity-decrease');
    const increaseButtons = document.querySelectorAll('.product-card__quantity-increase');
    const quantityInputs = document.querySelectorAll('.product-card__quantity-input');
    
    // Decrease quantity buttons
    decreaseButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const input = this.parentNode.querySelector('.product-card__quantity-input');
        let value = parseInt(input.value);
        if (value > 0) {
          value--;
          input.value = value;
          
          // If quantity is now 0, remove from cart
          if (value === 0) {
            // Logic to remove from cart would go here
            console.log('Item removed from cart');
          } else {
            // Update cart quantity
            console.log('Quantity decreased to ' + value);
          }
          
          // Trigger cart update
          updateCart(this.closest('.product-card'), value);
        }
      });
    });
    
    // Increase quantity buttons
    increaseButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const input = this.parentNode.querySelector('.product-card__quantity-input');
        let value = parseInt(input.value);
        value++;
        input.value = value;
        
        // If this is the first item, add to cart
        if (value === 1) {
          console.log('Item added to cart');
        } else {
          // Update cart quantity
          console.log('Quantity increased to ' + value);
        }
        
        // Trigger cart update
        updateCart(this.closest('.product-card'), value);
      });
    });
    
    // Direct input changes
    quantityInputs.forEach(input => {
      input.addEventListener('change', function() {
        let value = parseInt(this.value);
        
        // Ensure value is at least 0
        if (isNaN(value) || value < 0) {
          value = 0;
          this.value = 0;
        }
        
        // Update cart based on new value
        updateCart(this.closest('.product-card'), value);
      });
    });
  }
  
  function updateCart(productCard, quantity) {
    // In a real implementation, this would make an AJAX call to update the cart
    // For now, we'll just simulate by opening the cart drawer
    if (quantity > 0) {
      // Get product details for the cart
      const productTitle = productCard.querySelector('.product-card__title').textContent;
      const productVariant = productCard.querySelector('.product-card__variant')?.textContent || '';
      const productImage = productCard.querySelector('.product-card__image').src;
      const productPrice = productCard.querySelector('.product-card__price-amount').textContent;
      
      console.log(`Added/Updated cart: ${quantity}x ${productTitle} (${productVariant}) - ${productPrice}`);
      
      // Open cart drawer
      openCartDrawer();
      
      // Update cart count in header
      updateCartCount();
    }
  }
  
  function updateCartCount() {
    // This would normally calculate the total items in cart
    // For demo, we'll just increment a counter
    const cartCountElement = document.querySelector('.header__cart-count');
    if (cartCountElement) {
      // If it doesn't exist, create it
      let currentCount = parseInt(cartCountElement.textContent) || 0;
      currentCount++;
      cartCountElement.textContent = currentCount;
      
      // Make sure it's visible
      cartCountElement.style.display = 'flex';
    }
  }
  
  function setupWishlistButtons() {
    const wishlistButtons = document.querySelectorAll('.product-card__wishlist');
    
    wishlistButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Toggle active state
        const isActive = this.getAttribute('data-active') === 'true';
        this.setAttribute('data-active', !isActive);
        
        // Change the SVG fill
        const wishlistIcon = this.querySelector('.product-card__wishlist-icon svg');
        if (isActive) {
          wishlistIcon.setAttribute('fill', 'none');
        } else {
          wishlistIcon.setAttribute('fill', 'currentColor');
        }
        
        console.log(`Product ${isActive ? 'removed from' : 'added to'} wishlist`);
      });
    });
  }
  
  function setupCartDrawer() {
    // Create overlay if it doesn't exist
    if (!document.querySelector('.overlay')) {
      const overlay = document.createElement('div');
      overlay.classList.add('overlay');
      document.body.appendChild(overlay);
      
      // Close cart when clicking overlay
      overlay.addEventListener('click', function() {
        closeCartDrawer();
      });
    }
    
    // Create cart drawer if it doesn't exist yet
    if (!document.getElementById('cart-drawer')) {
      const cartDrawer = document.createElement('div');
      cartDrawer.id = 'cart-drawer';
      cartDrawer.classList.add('cart-drawer');
      
      cartDrawer.innerHTML = `
        <div class="cart-drawer__header">
          <h2 class="cart-drawer__title">Your basket</h2>
          <button class="cart-drawer__close" aria-label="Close cart">&times;</button>
        </div>
        <div class="cart-drawer__content">
          <div class="cart-drawer__empty">
            <p class="cart-drawer__empty-message">Your basket is empty</p>
            <a href="/collections/all" class="cart-drawer__continue">Continue shopping</a>
          </div>
        </div>
        <div class="cart-drawer__footer">
          <div class="cart-drawer__summary">
            <span>Total</span>
            <span>£0.00</span>
          </div>
          <button class="cart-drawer__checkout">Checkout now</button>
        </div>
      `;
      
      document.body.appendChild(cartDrawer);
      
      // Setup close button
      const closeButton = cartDrawer.querySelector('.cart-drawer__close');
      closeButton.addEventListener('click', function() {
        closeCartDrawer();
      });
      
      // Close cart when pressing Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cartDrawer.classList.contains('cart-drawer--open')) {
          closeCartDrawer();
        }
      });
    }
  }
  
  function openCartDrawer() {
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.querySelector('.overlay');
    
    if (cartDrawer) {
      cartDrawer.classList.add('cart-drawer--open');
      document.body.classList.add('drawer-open');
      
      if (overlay) {
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
      }
    }
  }
  
  function closeCartDrawer() {
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.querySelector('.overlay');
    
    if (cartDrawer) {
      cartDrawer.classList.remove('cart-drawer--open');
      document.body.classList.remove('drawer-open');
      
      if (overlay) {
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';
      }
    }
  }