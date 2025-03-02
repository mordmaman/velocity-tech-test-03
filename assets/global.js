// Header component JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Cart drawer functionality
    const cartTrigger = document.querySelector('.js-cart-trigger');
    const cartDrawer = document.getElementById('cart-drawer');
    
    if (cartTrigger && cartDrawer) {
      // Open cart drawer when clicking cart icon
      cartTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        toggleCartDrawer();
      });
      
      // Close cart when clicking outside
      document.addEventListener('click', function(e) {
        if (cartDrawer.classList.contains('cart-drawer--open') && 
            !cartDrawer.contains(e.target) && 
            !cartTrigger.contains(e.target)) {
          closeCartDrawer();
        }
      });
      
      // Close cart when pressing Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cartDrawer.classList.contains('cart-drawer--open')) {
          closeCartDrawer();
        }
      });
    }
    
    function toggleCartDrawer() {
      if (cartDrawer.classList.contains('cart-drawer--open')) {
        closeCartDrawer();
      } else {
        openCartDrawer();
      }
    }
    
    function openCartDrawer() {
      cartDrawer.classList.add('cart-drawer--open');
      document.body.classList.add('drawer-open');
      cartTrigger.setAttribute('aria-expanded', 'true');
    }
    
    function closeCartDrawer() {
      cartDrawer.classList.remove('cart-drawer--open');
      document.body.classList.remove('drawer-open');
      cartTrigger.setAttribute('aria-expanded', 'false');
    }
  });