// Enhanced script.js with register button fix and deployment-safe calculations
document.addEventListener("DOMContentLoaded", function () {
  console.log("🌱 Food Gardening Support System loaded");

  // Modern navbar scroll effect
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    function onScroll() {
      if (window.scrollY > 8) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
    window.addEventListener("scroll", onScroll);
    onScroll();
  }

  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
      navToggle.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
    });
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(event) {
      if (mobileNav.classList.contains('open') && 
          !event.target.closest('.navbar') && 
          !event.target.closest('.mobile-nav')) {
        mobileNav.classList.remove('open');
        navToggle.textContent = '☰';
      }
    });
  }

  // Simple client-side auth and navigation
  (function () {
    const USERS_KEY = "fg_users_v1";
    const CURRENT_KEY = "fg_current_user";
    
    function getUsers() {
      try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
      } catch (e) {
        console.error("Error reading users:", e);
        return {};
      }
    }
    
    function saveUsers(u) {
      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(u));
        return true;
      } catch (e) {
        console.error("Error saving users:", e);
        return false;
      }
    }
    
    function setCurrent(username) {
      try {
        localStorage.setItem(CURRENT_KEY, username);
      } catch (e) {
        console.error("Error setting current user:", e);
      }
    }
    
    function getCurrent() {
      return localStorage.getItem(CURRENT_KEY);
    }
    
    function logout() {
      localStorage.removeItem(CURRENT_KEY);
      if (mobileNav) mobileNav.classList.remove('open');
      if (navToggle) navToggle.textContent = '☰';
    }

    const path = window.location.pathname.split("/").pop() || "index.html";
    console.log("Current page:", path);

    // ========== LOGIN/REGISTER PAGE FUNCTIONALITY ==========
    if (path === "index.html" || path === "" || path === "login.html") {
      const form = document.getElementById("login-form");
      const feedback = document.getElementById("login-feedback");
      const regBtn = document.getElementById("register-btn");
      
      console.log("Login page elements:", { 
        form: !!form, 
        feedback: !!feedback, 
        registerBtn: !!regBtn 
      });

      // Redirect if already logged in
      if (getCurrent()) {
        console.log("User already logged in, redirecting to home");
        location.href = "home.html";
        return;
      }
      
      // Login form handler
      if (form) {
        form.addEventListener("submit", function (ev) {
          ev.preventDefault();
          const userEl = document.getElementById("username");
          const passEl = document.getElementById("password");
          
          if (!userEl || !passEl) {
            console.error("Login form elements not found");
            if (feedback) feedback.textContent = "Error: Form elements missing";
            return;
          }
          
          const u = userEl.value.trim();
          const p = passEl.value;
          const users = getUsers();
          
          if (!u || !p) {
            if (feedback) feedback.textContent = "Please enter both username and password";
            return;
          }
          
          if (!users[u]) {
            if (feedback) feedback.textContent = "User not found — try Register or create a new account.";
            return;
          }
          
          if (users[u] !== p) {
            if (feedback) feedback.textContent = "Incorrect password.";
            return;
          }
          
          setCurrent(u);
          if (feedback) feedback.textContent = "Login successful! Redirecting...";
          setTimeout(() => {
            location.href = "home.html";
          }, 1000);
        });
      }
      
      // ========== REGISTER BUTTON FUNCTIONALITY ==========
      if (regBtn) {
        console.log("Register button found, attaching event listener");
        regBtn.addEventListener("click", function (e) {
          e.preventDefault();
          console.log("Register button clicked");
          
          // Get registration form elements
          const userEl = document.getElementById("username");
          const passEl = document.getElementById("password");
          const feedback = document.getElementById("login-feedback");
          
          if (!userEl || !passEl) {
            console.error("Registration form elements not found");
            if (feedback) feedback.textContent = "Error: Cannot access form fields";
            return;
          }
          
          const username = userEl.value.trim();
          const password = passEl.value;
          
          // Validation
          if (!username) {
            if (feedback) feedback.textContent = "Please enter a username";
            userEl.focus();
            return;
          }
          
          if (!password) {
            if (feedback) feedback.textContent = "Please enter a password";
            passEl.focus();
            return;
          }
          
          if (password.length < 3) {
            if (feedback) feedback.textContent = "Password must be at least 3 characters";
            passEl.focus();
            return;
          }
          
          // Get existing users
          const users = getUsers();
          
          // Check if user already exists
          if (users[username]) {
            if (feedback) feedback.textContent = "Username already exists. Please choose another.";
            userEl.focus();
            return;
          }
          
          // Register new user
          users[username] = password;
          const saved = saveUsers(users);
          
          if (saved) {
            if (feedback) {
              feedback.textContent = "Registration successful! You can now login.";
              feedback.style.color = "#388e3c";
            }
            console.log("New user registered:", username);
            
            // Clear form and focus on username
            userEl.value = "";
            passEl.value = "";
            userEl.focus();
            
            // Show success message for 3 seconds
            setTimeout(() => {
              if (feedback) feedback.textContent = "";
            }, 3000);
          } else {
            if (feedback) feedback.textContent = "Error: Could not save user data";
          }
        });
      } else {
        console.error("Register button not found with ID 'register-btn'");
      }
      
      return;
    }

    // ========== REGISTRATION PAGE (if separate) ==========
    if (path === "register.html") {
      const regForm = document.getElementById("register-form");
      const feedback = document.getElementById("register-feedback");
      
      if (regForm) {
        regForm.addEventListener("submit", function (ev) {
          ev.preventDefault();
          
          const userEl = document.getElementById("new-username") || document.getElementById("username");
          const passEl = document.getElementById("new-password") || document.getElementById("password");
          const confirmEl = document.getElementById("confirm-password");
          
          if (!userEl || !passEl) {
            if (feedback) feedback.textContent = "Error: Form elements missing";
            return;
          }
          
          const username = userEl.value.trim();
          const password = passEl.value;
          const confirmPassword = confirmEl ? confirmEl.value : password;
          
          // Validation
          if (!username) {
            if (feedback) feedback.textContent = "Please enter a username";
            return;
          }
          
          if (!password) {
            if (feedback) feedback.textContent = "Please enter a password";
            return;
          }
          
          if (password.length < 3) {
            if (feedback) feedback.textContent = "Password must be at least 3 characters";
            return;
          }
          
          if (confirmEl && password !== confirmPassword) {
            if (feedback) feedback.textContent = "Passwords do not match";
            return;
          }
          
          // Get existing users
          const users = getUsers();
          
          // Check if user already exists
          if (users[username]) {
            if (feedback) feedback.textContent = "Username already exists. Please choose another.";
            return;
          }
          
          // Register new user
          users[username] = password;
          const saved = saveUsers(users);
          
          if (saved) {
            if (feedback) {
              feedback.textContent = "Registration successful! Redirecting to login...";
              feedback.style.color = "#388e3c";
            }
            
            // Auto-login and redirect
            setCurrent(username);
            setTimeout(() => {
              location.href = "home.html";
            }, 1500);
          } else {
            if (feedback) feedback.textContent = "Error: Could not save user data";
          }
        });
      }
      return;
    }

    // ========== PROTECTED PAGES CHECK ==========
    const protectedPages = [
      "home.html",
      "educational.html",
      "profitability.html",
      "area.html",
      "planting.html",
      "soil.html",
    ];
    
    if (protectedPages.includes(path)) {
      if (!getCurrent()) {
        console.log("No user logged in, redirecting to login");
        location.href = "index.html";
        return;
      }
      
      // Update welcome message if element exists
      const welcomeEl = document.getElementById('welcome-user');
      if (welcomeEl) {
        welcomeEl.textContent = `Welcome, ${getCurrent()}!`;
      }
    }

    // ========== LOGOUT FUNCTIONALITY ==========
    document.addEventListener("click", function (e) {
      const target = e.target.closest(".nav-logout, .mobile-logout");
      if (target) {
        if (confirm("Are you sure you want to logout?")) {
          logout();
          location.href = "index.html";
        }
      }
    });

    // --- CALCULATOR LOGIC WITH DEPLOYMENT FIXES ---
    
    // Profitability Calculator
    if (path === "profitability.html") {
      console.log("Initializing profitability calculator");
      
      const form = document.getElementById("profit-form");
      const result = document.getElementById("profit-result");
      
      if (form && result) {
        form.addEventListener("submit", function (ev) {
          ev.preventDefault();
          
          const yieldInput = document.getElementById("yield");
          const priceInput = document.getElementById("price");
          const costsInput = document.getElementById("costs");
          
          if (!yieldInput || !priceInput || !costsInput) {
            result.innerHTML = '<span style="color: #d32f2f;">Error: Form elements missing</span>';
            return;
          }
          
          const y = parseFloat(yieldInput.value);
          const p = parseFloat(priceInput.value);
          const c = parseFloat(costsInput.value);
          
          // Validation
          if (isNaN(y) || isNaN(p) || isNaN(c)) {
            result.innerHTML = '<span style="color: #d32f2f;">Please fill all fields with valid numbers</span>';
            return;
          }
          
          // Calculations
          const revenue = y * p;
          const profit = revenue - c;
          const profitColor = profit >= 0 ? "#388e3c" : "#d32f2f";
          const profitText = profit >= 0 ? "Profit" : "Loss";
          
          // Display results
          result.innerHTML = `
            <div style="background: #f8fff3; padding: 16px; border-radius: 8px; border-left: 4px solid #388e3c;">
              <div style="margin-bottom: 12px; font-size: 1.1em;">
                <strong>Revenue:</strong> R${revenue.toFixed(2)}
              </div>
              <div style="color: ${profitColor}; font-size: 1.2em; font-weight: bold;">
                <strong>${profitText}:</strong> R${Math.abs(profit).toFixed(2)}
              </div>
              ${profit < 0 ? '<div style="margin-top: 8px; color: #666; font-size: 0.9em;">Consider reducing costs or increasing yield</div>' : ''}
            </div>
          `;
        });
      }
    }
    
    // Area Calculator
    if (path === "area.html") {
      console.log("Initializing area calculator");
      
      const form = document.getElementById("area-form");
      const result = document.getElementById("area-result");
      
      if (form && result) {
        form.addEventListener("submit", function (ev) {
          ev.preventDefault();
          
          const plantsInput = document.getElementById("num-plants");
          const areaInput = document.getElementById("area-per-plant");
          
          if (!plantsInput || !areaInput) {
            result.innerHTML = '<span style="color: #d32f2f;">Error: Form elements missing</span>';
            return;
          }
          
          const n = parseInt(plantsInput.value, 10);
          const a = parseFloat(areaInput.value);
          
          // Validation
          if (isNaN(n) || isNaN(a) || n < 1 || a <= 0) {
            result.innerHTML = '<span style="color: #d32f2f;">Please enter valid numbers (plants ≥ 1, area > 0)</span>';
            return;
          }
          
          // Calculation
          const total = n * a;
          
          // Display results
          let guidance = '';
          if (total > 100) {
            guidance = '<div style="margin-top: 8px; color: #666; font-size: 0.9em;">💡 That\'s a substantial garden area! Consider starting smaller if you\'re new to gardening.</div>';
          } else if (total > 50) {
            guidance = '<div style="margin-top: 8px; color: #666; font-size: 0.9em;">💡 Medium-sized garden. Perfect for a family vegetable patch!</div>';
          } else {
            guidance = '<div style="margin-top: 8px; color: #666; font-size: 0.9em;">💡 Perfect for container gardening or small raised beds!</div>';
          }
          
          result.innerHTML = `
            <div style="background: #f8fff3; padding: 16px; border-radius: 8px; border-left: 4px solid #388e3c;">
              <div style="font-size: 1.2em; font-weight: bold; color: #256029; margin-bottom: 8px;">
                Total Area Needed: ${total.toFixed(2)} m²
              </div>
              <div style="color: #666; font-size: 0.9em;">
                For ${n} plants requiring ${a} m² each
              </div>
              ${guidance}
            </div>
          `;
        });
      }
    }
    
  })(); // End of auth and calculators

  console.log("🌱 All scripts initialized successfully");
});