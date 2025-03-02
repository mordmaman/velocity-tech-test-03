// Cart functionality JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('hello')
    // Setup cart functionality
    const Cart = {
      // Cart state
      items: [],
      
      // Initialize cart
      init: function() {
        this.setupCartDrawer();
        this.setupQuantityControls();
        this.setupCartForms();
        this.setupRemoveButtons();
        
        // Fetch initial cart state
        this.fetchCart();
      },
      
      // Setup the cart drawer and its toggle
      setupCartDrawer: function() {
        // Create overlay if it doesn't exist
        if (!document.querySelector('.overlay')) {
          const overlay = document.createElement('div');
          overlay.classList.add('overlay');
          document.body.appendChild(overlay);
          
          // Close cart when clicking overlay
          overlay.addEventListener('click', function() {
            Cart.closeCartDrawer();
          });
        }
        
        // Setup cart drawer triggers
        const cartTriggers = document.querySelectorAll('.js-cart-trigger');
        cartTriggers.forEach(trigger => {
          trigger.addEventListener('click', function(e) {
            e.preventDefault();
            Cart.toggleCartDrawer();
          });
        });
        
        // Setup close button if cart drawer exists
        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
          const closeButton = cartDrawer.querySelector('.cart-drawer__close');
          if (closeButton) {
            closeButton.addEventListener('click', function() {
              Cart.closeCartDrawer();
            });
          }
          
          // Close cart when pressing Escape key
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && cartDrawer.classList.contains('cart-drawer--open')) {
              Cart.closeCartDrawer();
            }
          });
        }
      },
      
      // Setup quantity controls for product cards
      setupQuantityControls: function() {
        console.log('hello')
        // Decrease quantity buttons
        document.querySelectorAll('.js-quantity-decrease').forEach(button => {
          button.addEventListener('click', function() {
            const input = this.parentNode.querySelector('.js-quantity-input');
            const form = this.closest('form');
            let value = parseInt(input.value);
            
            if (value > 0) {
              value--;
              input.value = value;
              
              // If product is in cart and quantity now 0, remove it
              if (value === 0) {
                const lineItem = Cart.findCartItemByVariantId(form.querySelector('[name="id"]').value);
                if (lineItem) {
                  Cart.removeFromCart(lineItem.key);
                }
              } else {
                // Otherwise update quantity
                Cart.updateCartItem(form);
              }
            }
          });
        });
        
        // Increase quantity buttons
        document.querySelectorAll('.js-quantity-increase').forEach(button => {
          button.addEventListener('click', function() {
            const input = this.parentNode.querySelector('.js-quantity-input');
            const form = this.closest('form');
            let value = parseInt(input.value);
            
            value++;
            input.value = value;
            
            // Add to cart
            Cart.updateCartItem(form);
          });
        });
        
        // Direct input changes
        document.querySelectorAll('.js-quantity-input').forEach(input => {
          input.addEventListener('change', function() {
            const form = this.closest('form');
            let value = parseInt(this.value);
            
            // Ensure value is at least 0
            if (isNaN(value) || value < 0) {
              value = 0;
              this.value = 0;
            }
            
            if (value === 0) {
              const lineItem = Cart.findCartItemByVariantId(form.querySelector('[name="id"]').value);
              if (lineItem) {
                Cart.removeFromCart(lineItem.key);
              }
            } else {
              Cart.updateCartItem(form);
            }
          });
        });
      },
      
      // Setup cart forms for AJAX submission
      setupCartForms: function() {
        document.querySelectorAll('.js-ajax-cart-form').forEach(form => {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            Cart.updateCartItem(this);
          });
        });
      },
      
      // Setup remove buttons in cart
      setupRemoveButtons: function() {
        document.querySelectorAll('.js-cart-remove').forEach(button => {
          button.addEventListener('click', function() {
            const key = this.getAttribute('data-item-key');
            if (key) {
              Cart.removeFromCart(key);
            }
          });
        });
      },
      
      // Toggle cart drawer
      toggleCartDrawer: function() {
        const cartDrawer = document.getElementById('cart-drawer');
        
        if (cartDrawer) {
          if (cartDrawer.classList.contains('cart-drawer--open')) {
            this.closeCartDrawer();
          } else {
            this.openCartDrawer();
          }
        }
      },
      
      // Open cart drawer
      openCartDrawer: function() {
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
      },
      
      // Close cart drawer
      closeCartDrawer: function() {
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
      },
      
      // Fetch current cart contents
      fetchCart: function() {
        fetch('/cart.js')
          .then(response => response.json())
          .then(cart => {
            this.items = cart.items;
            this.updateCartUI(cart);
          })
          .catch(error => {
            console.error('Error fetching cart:', error);
          });
      },
      
      // Add item to cart
      addToCart: function(formData) {
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
          .then(response => response.json())
          .then(item => {
            this.fetchCart(); // Refresh cart
            this.openCartDrawer(); // Show cart
          })
          .catch(error => {
            console.error('Error adding to cart:', error);
          });
      },
      
      // Update cart item
      updateCartItem: function(form) {
        const formData = new FormData(form);
        const data = {
          id: formData.get('id'),
          quantity: parseInt(formData.get('quantity'))
        };
        
        if (data.quantity > 0) {
          // Find if item exists in cart
          const lineItem = this.findCartItemByVariantId(data.id);
          
          if (lineItem) {
            // Update existing item
            this.changeCartItemQuantity(lineItem.key, data.quantity);
          } else {
            // Add new item
            this.addToCart(data);
          }
        }
      },
      
      // Change quantity of cart item
      changeCartItemQuantity: function(key, quantity) {
        fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: key,
            quantity: quantity
          })
        })
          .then(response => response.json())
          .then(cart => {
            this.items = cart.items;
            this.updateCartUI(cart);
            this.openCartDrawer(); // Show cart
          })
          .catch(error => {
            console.error('Error updating cart:', error);
          });
      },
      
      // Remove item from cart
      removeFromCart: function(key) {
        this.changeCartItemQuantity(key, 0);
      },
      
      // Find cart item by variant ID
      findCartItemByVariantId: function(variantId) {
        return this.items.find(item => item.variant_id == variantId);
      },
      
      // Update all cart UI elements
      updateCartUI: function(cart) {
        // Update cart count
        this.updateCartCount(cart.item_count);
        
        // Update cart drawer content if needed
        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
          this.updateCartDrawerContent(cart);
        }
        
        // Update quantity inputs for products that are in the cart
        this.updateProductQuantities();
      },
      
      // Update cart count in header
      updateCartCount: function(count) {
        const cartCountElements = document.querySelectorAll('.header__cart-count');
        
        cartCountElements.forEach(element => {
          if (count > 0) {
            element.textContent = count;
            element.style.display = 'flex';
          } else {
            element.style.display = 'none';
          }
        });
      },
      
      // Update cart drawer content
      updateCartDrawerContent: function(cart) {
        const cartContent = document.querySelector('.cart-drawer__content');
        const cartTotal = document.querySelector('.cart-drawer__summary span:last-child');
        
        if (cartContent && cartTotal) {
          // Update cart total
          cartTotal.textContent = this.formatMoney(cart.total_price);
          
          // Show empty cart or items based on cart state
          if (cart.item_count === 0) {
            cartContent.innerHTML = `
              <div class="cart-drawer__empty">
                <p class="cart-drawer__empty-message">Your basket is empty</p>
                <a href="/collections/all" class="cart-drawer__continue">Continue shopping</a>
              </div>
            `;
          } else {
            // Create HTML for cart items
            let cartItemsHTML = '<div class="cart-drawer__items">';
            
            cart.items.forEach(item => {
              cartItemsHTML += `
                <div class="cart-item" data-item-id="${item.id}">
                  <img 
                    src="${item.image}" 
                    alt="${item.title}"
                    class="cart-item__image"
                    width="80"
                    height="80"
                    loading="lazy">
                  
                  <div class="cart-item__content">
                    <h3 class="cart-item__title">${item.product_title}</h3>
                    
                    ${item.variant_title && item.variant_title !== 'Default Title' ? 
                      `<p class="cart-item__variant">${item.variant_title}</p>` : ''}
                    
                    <div class="cart-item__footer">
                      <div class="cart-item__quantity">
                        <button class="cart-item__quantity-button cart-item__quantity-decrease js-cart-qty-decrease" data-item-key="${item.key}" aria-label="Decrease quantity">
                          <span>-</span>
                        </button>
                        <input type="number" class="cart-item__quantity-input js-cart-qty" 
                          value="${item.quantity}" min="1" max="99" 
                          data-item-key="${item.key}" aria-label="Item quantity">
                        <button class="cart-item__quantity-button cart-item__quantity-increase js-cart-qty-increase" data-item-key="${item.key}" aria-label="Increase quantity">
                          <span>+</span>
                        </button>
                      </div>
                      
                      <div class="cart-item__price">
                        ${this.formatMoney(item.final_line_price)}
                      </div>
                    </div>
                  </div>
                  
                  <button class="cart-item__remove js-cart-remove" data-item-key="${item.key}" aria-label="Remove item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              `;
            });
            
            cartItemsHTML += '</div>';
            cartContent.innerHTML = cartItemsHTML;
            
            // Setup new event listeners for the cart items
            this.setupCartItemEvents();
          }
        }
      },
      
      // Update quantity inputs on product cards to reflect cart quantities
      updateProductQuantities: function() {
        // Reset all quantity inputs to 0
        document.querySelectorAll('.js-ajax-cart-form').forEach(form => {
          const variantId = form.querySelector('[name="id"]').value;
          const quantityInput = form.querySelector('.js-quantity-input');
          
          // Find if this product variant is in the cart
          const lineItem = this.findCartItemByVariantId(variantId);
          
          if (lineItem) {
            quantityInput.value = lineItem.quantity;
          } else {
            quantityInput.value = 0;
          }
        });
      },
      
      // Setup events for cart item controls
      setupCartItemEvents: function() {
        // Decrease quantity buttons in cart
        document.querySelectorAll('.js-cart-qty-decrease').forEach(button => {
          button.addEventListener('click', function() {
            const key = this.getAttribute('data-item-key');
            const input = this.parentNode.querySelector('.js-cart-qty');
            let value = parseInt(input.value);
            
            if (value > 1) {
              value--;
              Cart.changeCartItemQuantity(key, value);
            } else {
              Cart.removeFromCart(key);
            }
          });
        });
        
        // Increase quantity buttons in cart
        document.querySelectorAll('.js-cart-qty-increase').forEach(button => {
          button.addEventListener('click', function() {
            const key = this.getAttribute('data-item-key');
            const input = this.parentNode.querySelector('.js-cart-qty');
            let value = parseInt(input.value);
            
            value++;
            Cart.changeCartItemQuantity(key, value);
          });
        });
        
        // Direct input changes in cart
        document.querySelectorAll('.js-cart-qty').forEach(input => {
          input.addEventListener('change', function() {
            const key = this.getAttribute('data-item-key');
            let value = parseInt(this.value);
            
            if (isNaN(value) || value <= 0) {
              Cart.removeFromCart(key);
            } else {
              Cart.changeCartItemQuantity(key, value);
            }
          });
        });
        
        // Remove buttons
        this.setupRemoveButtons();
      },
      
      // Format money values consistently
      formatMoney: function(cents) {
        const value = (cents / 100).toFixed(2);
        return '£' + value;
      }
    };
    
    // Initialize the cart functionality
    Cart.init();
    
    // Setup wishlist toggle functionality
    const Wishlist = {
      init: function() {
        this.setupWishlistButtons();
      },
      
      setupWishlistButtons: function() {
        document.querySelectorAll('.js-wishlist-toggle').forEach(button => {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle active state
            const isActive = this.getAttribute('data-active') === 'true';
            this.setAttribute('data-active', !isActive);
            
            // Change the SVG fill
            const wishlistSvg = this.querySelector('svg');
            if (isActive) {
              wishlistSvg.setAttribute('fill', 'none');
            } else {
              wishlistSvg.setAttribute('fill', 'currentColor');
            }
            
            // Get product ID
            const productId = this.getAttribute('data-product-id');
            
            console.log(`Product ${productId} ${isActive ? 'removed from' : 'added to'} wishlist`);
            
            // Here you would typically send an AJAX request to update the wishlist state
            // This is just a placeholder for when you implement actual wishlist functionality
          });
        });
      }
    };
    
    // Initialize the wishlist functionality
    Wishlist.init();
  });