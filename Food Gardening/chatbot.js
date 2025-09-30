// Working Chatbot with Gardening Knowledge Base
(function () {
  // Create widget HTML
  const widget = document.createElement('div');
  widget.id = 'chatbot-widget';
  widget.innerHTML = `
    <button id="chatbot-toggle" aria-label="Toggle Chatbot">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#388e3c"/>
        <path d="M7 10.5C7 9.11929 8.11929 8 9.5 8H14.5C15.8807 8 17 9.11929 17 10.5V13.5C17 14.8807 15.8807 16 14.5 16H10.4142C10.149 16 9.89464 16.1054 9.70711 16.2929L8.35355 17.6464C8.15829 17.8417 7.84171 17.8417 7.64645 17.6464C7.45118 17.4512 7.45118 17.1346 7.64645 16.9393L8.29289 16.2929C8.10536 16.1054 8 15.851 8 15.5858V10.5Z" fill="#fff"/>
      </svg>
    </button>
    <div id="chatbot-box" style="display:none;">
      <div id="chatbot-header">
        <span>Gardening Assistant 🌱</span>
        <button id="chatbot-close" aria-label="Close Chatbot">×</button>
      </div>
      <div id="chatbot-messages">
        <div class="chatbot-bot">Hello! I can help with gardening questions. Ask me about plants, soil, watering, or gardening tips for South Africa! 🌿</div>
      </div>
      <form id="chatbot-form">
        <input id="chatbot-input" type="text" placeholder="Ask about gardening..." autocomplete="off" required />
        <button type="submit">Send</button>
      </form>
    </div>
  `;
  document.body.appendChild(widget);

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #chatbot-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: inherit;
    }
    #chatbot-toggle {
      background: #388e3c;
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      font-size: 2em;
      box-shadow: 0 2px 8px rgba(44,80,44,0.13);
      cursor: pointer;
      transition: background 0.18s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #chatbot-toggle:hover { background: #256029; }
    #chatbot-box {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(44,80,44,0.18);
      width: 350px;
      max-width: 95vw;
      padding: 0;
      margin-bottom: 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    #chatbot-header {
      background: #388e3c;
      color: #fff;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }
    #chatbot-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.3em;
      cursor: pointer;
    }
    #chatbot-messages {
      padding: 16px;
      height: 250px;
      overflow-y: auto;
      background: #f8fff3;
      font-size: 0.95em;
    }
    #chatbot-form {
      display: flex;
      border-top: 1px solid #e6efe2;
      background: #f8fff3;
      padding: 10px;
    }
    #chatbot-input {
      flex: 1;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e6efe2;
      font-size: 0.95em;
      margin-right: 8px;
    }
    #chatbot-form button[type="submit"] {
      background: #388e3c;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0 16px;
      font-size: 0.95em;
      cursor: pointer;
      transition: background 0.18s;
    }
    #chatbot-form button[type="submit"]:hover { background: #256029; }
    .chatbot-user { 
      color: #256029; 
      margin-bottom: 8px; 
      font-weight: 600;
      padding: 8px 12px;
      background: #e8f5e9;
      border-radius: 8px;
      text-align: right;
    }
    .chatbot-bot { 
      color: #0b2b11; 
      margin-bottom: 12px;
      padding: 8px 12px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e6efe2;
      line-height: 1.4;
    }
    .chatbot-thinking {
      color: #5a6b5a;
      font-style: italic;
    }
  `;
  document.head.appendChild(style);

  // Gardening Knowledge Base
  const gardeningKnowledge = {
    // Plants
    'tomato': "🍅 **Tomatoes**: Need full sun (6-8 hours), well-drained soil pH 6.0-6.8. Plant after frost, space 60-90cm apart. Water deeply 2-3 times weekly. Harvest in 60-90 days. Common varieties for SA: Floradade, Moneymaker.",
    'carrot': "🥕 **Carrots**: Prefer loose, sandy soil without stones. Plant seeds 1cm deep, thin to 5-8cm apart. Keep soil moist. Ready in 70-80 days. Good for SA winter gardens.",
    'lettuce': "🥬 **Lettuce**: Cool-weather crop. Plant in partial shade in hot areas, keep soil moist. Harvest in 30-60 days. Grows well in most SA regions.",
    'spinach': "🌿 **Spinach**: Rich in iron, prefers cool weather. Plant in rich soil, harvest in 40-50 days. Good for SA autumn planting.",
    'potato': "🥔 **Potatoes**: Plant seed potatoes in well-drained soil 8cm deep, 30cm apart. Hill soil as plants grow. Harvest in 70-120 days.",
    'onion': "🧅 **Onions**: Plant sets or seeds in well-drained soil. Space 10-15cm apart. Harvest when tops fall over.",
    'pepper': "🌶️ **Peppers**: Need warm weather and full sun. Space 45-60cm apart. Harvest in 60-90 days.",
    
    // Gardening Techniques
    'soil': "🌱 **Soil Preparation**: Well-drained loam soil ideal. Add compost annually. Test pH (6.0-7.0 best). For SA clay soils, add organic matter like compost.",
    'compost': "♻️ **Composting**: Layer greens (kitchen scraps) and browns (leaves, paper). Turn monthly. Ready in 2-6 months. Great for SA garden waste.",
    'water': "💧 **Watering**: Most veggies need 25-50mm water weekly. Water deeply at base in morning. Adjust for SA rainy seasons.",
    'fertilizer': "🌿 **Fertilizing**: Use balanced fertilizer (2:3:2) or organic options. Apply at planting and growth stages.",
    'pest': "🐛 **Pest Control**: Use neem oil for aphids, beer traps for snails. Companion planting helps. SA common pests: aphids, cutworms, snails.",
    
    // South Africa Specific
    'climate': "☀️ **SA Climate Tips**: Coastal areas: year-round planting. Highveld: spring-summer focus. Karoo: drought-tolerant plants. Western Cape: Mediterranean climate.",
    'season': "📅 **SA Planting Seasons**: Summer (Oct-Dec): tomatoes, maize, beans. Winter (Mar-May): carrots, spinach, onions, peas.",
    'beginner': "👩‍🌾 **Beginner Tips**: Start with lettuce, beans, tomatoes. Use containers if space limited. Water consistently. South Africa has great growing conditions!",
    
    // General
    'hello': "Hello! 🌱 I'm your gardening assistant. Ask me about plants, soil, watering, or gardening in South Africa!",
    'help': "I can help with: 🌿 Plant care (tomatoes, carrots, etc.) 💧 Watering advice 🌱 Soil preparation 🐛 Pest control 📅 Planting seasons for South Africa",
    'thank': "You're welcome! Happy gardening! 🌻",
    
    // Default fallback
    'default': "I'm not sure about that specific question, but I can help with gardening topics like:\n\n• Plant care (tomatoes, carrots, lettuce)\n• Soil preparation and composting\n• Watering schedules\n• Pest control\n• South African gardening seasons\n\nTry asking about a specific plant or gardening technique! 🌿"
  };

  // Show/hide logic
  const toggleBtn = widget.querySelector('#chatbot-toggle');
  const box = widget.querySelector('#chatbot-box');
  const closeBtn = widget.querySelector('#chatbot-close');

  toggleBtn.onclick = () => {
    box.style.display = box.style.display === 'none' ? 'flex' : 'none';
  };

  closeBtn.onclick = () => {
    box.style.display = 'none';
  };

  // Chat logic
  const form = widget.querySelector('#chatbot-form');
  const input = widget.querySelector('#chatbot-input');
  const messages = widget.querySelector('#chatbot-messages');

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = sender === 'user' ? 'chatbot-user' : 'chatbot-bot';
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function findAnswer(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Check for exact matches first
    for (const [key, answer] of Object.entries(gardeningKnowledge)) {
      if (lowerQuestion.includes(key)) {
        return answer;
      }
    }
    
    // Check for related terms
    if (lowerQuestion.includes('grow') || lowerQuestion.includes('plant') || lowerQuestion.includes('cultivate')) {
      if (lowerQuestion.includes('how')) {
        return "To grow plants successfully: choose the right location, prepare the soil, plant at the correct depth, water properly, and provide ongoing care. Ask about a specific plant for detailed instructions!";
      }
    }
    
    if (lowerQuestion.includes('when') && lowerQuestion.includes('plant')) {
      return gardeningKnowledge.season;
    }
    
    if (lowerQuestion.includes('best') && lowerQuestion.includes('plant')) {
      return "For beginners in South Africa: tomatoes, lettuce, beans, and carrots are great choices. They're relatively easy and grow well in most regions.";
    }
    
    return gardeningKnowledge.default;
  }

  form.addEventListener('submit', function(ev) {
    ev.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    
    // Add user message
    addMessage(question, 'user');
    input.value = '';
    
    // Show thinking message
    const thinkingMsg = document.createElement('div');
    thinkingMsg.className = 'chatbot-bot chatbot-thinking';
    thinkingMsg.textContent = 'Thinking...';
    messages.appendChild(thinkingMsg);
    messages.scrollTop = messages.scrollHeight;
    
    // Simulate thinking delay, then respond
    setTimeout(() => {
      messages.removeChild(thinkingMsg);
      const answer = findAnswer(question);
      addMessage(answer, 'bot');
    }, 800);
  });

  // Focus input when chatbot opens
  toggleBtn.addEventListener('click', () => {
    setTimeout(() => input.focus(), 100);
  });
})();