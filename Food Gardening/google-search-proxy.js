// Google Custom Search JSON API proxy for real-time gardening answers
const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3003;
const GOOGLE_API_KEY = 'AIzaSyD9Yf66-4_TMUPV4E_7zYxzox0K7BhVi_s';
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || 'YOUR_SEARCH_ENGINE_ID'; // You need to create this

function fetchGoogleSearch(query, callback) {
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`;
    
    console.log(`🔍 Searching Google for: ${query}`);
    
    https.get(apiUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                callback(null, json);
            } catch (err) {
                callback(err);
            }
        });
    }).on('error', (err) => callback(err));
}

function extractGardeningAnswer(searchData, originalQuery) {
    // Check if we have search results
    if (!searchData.items || searchData.items.length === 0) {
        return generateGardeningFallback(originalQuery);
    }

    const firstResult = searchData.items[0];
    
    // Return the most relevant snippet from the first result
    if (firstResult.snippet) {
        return {
            answer: firstResult.snippet,
            source: 'google_search',
            title: firstResult.title,
            link: firstResult.link,
            displayLink: firstResult.displayLink
        };
    }
    
    // Fallback to our gardening knowledge base
    return generateGardeningFallback(originalQuery);
}

function generateGardeningFallback(query) {
    const lowerQuery = query.toLowerCase();
    
    const gardeningKnowledge = {
        'tomato': "🍅 **Tomatoes**: Need full sun (6-8 hours), well-drained soil pH 6.0-6.8. Plant after frost, space 60-90cm apart. Water deeply 2-3 times weekly. Harvest in 60-90 days. Common in South African gardens.",
        'carrot': "🥕 **Carrots**: Prefer loose, sandy soil. Plant seeds 1cm deep, thin to 5-8cm apart. Keep soil moist. Ready in 70-80 days. Good for SA winter gardens.",
        'lettuce': "🥬 **Lettuce**: Cool-weather crop. Plant in partial shade, keep soil moist. Harvest in 30-60 days. Grows well in most SA regions.",
        'spinach': "🌿 **Spinach**: Rich in iron, prefers cool weather. Plant in rich soil, harvest in 40-50 days. Good for SA autumn planting.",
        'potato': "🥔 **Potatoes**: Plant seed potatoes in well-drained soil 8cm deep, 30cm apart. Hill soil as plants grow. Harvest in 70-120 days.",
        'onion': "🧅 **Onions**: Plant sets or seeds in well-drained soil. Space 10-15cm apart. Harvest when tops fall over. Good for SA winter gardens.",
        'pepper': "🌶️ **Peppers**: Need warm weather and full sun. Space 45-60cm apart. Harvest in 60-90 days. Bell peppers do well in SA summer.",
        'cucumber': "🥒 **Cucumbers**: Warm season crop, need trellising. Space 60-90cm apart. Harvest in 50-70 days.",
        'bean': "🫘 **Beans**: Bush beans space 10-15cm, pole beans need support. Harvest in 50-60 days. Easy for SA beginners.",
        'soil': "🌱 **Soil Preparation**: Well-drained loam soil ideal. Add compost annually. Test pH (6.0-7.0 best). For SA clay soils, add organic matter.",
        'compost': "♻️ **Composting**: Layer greens (kitchen scraps) and browns (leaves). Turn monthly. Ready in 2-6 months. Great for SA garden waste.",
        'water': "💧 **Watering**: Most veggies need 25-50mm water weekly. Water deeply at base in morning. Adjust for SA rainy seasons.",
        'fertilizer': "🌿 **Fertilizing**: Use balanced fertilizer (2:3:2) or organic options. Apply at planting and growth stages. Compost tea works well.",
        'pest': "🐛 **Pest Control**: Use neem oil for aphids, beer traps for snails. Companion planting helps. SA common: aphids, cutworms, snails.",
        'climate': "☀️ **SA Climate Tips**: Coastal: year-round planting. Highveld: spring-summer focus. Karoo: drought-tolerant plants. Western Cape: Mediterranean climate.",
        'season': "📅 **SA Planting Seasons**: Summer (Oct-Dec): tomatoes, maize, beans. Winter (Mar-May): carrots, spinach, onions, peas.",
        'beginner': "👩‍🌾 **Beginner Tips**: Start with lettuce, beans, tomatoes. Use containers if space limited. Water consistently. South Africa has great growing conditions!",
        'container': "🪴 **Container Gardening**: Use pots with drainage. Good soil mix. Water daily in summer. Great for SA balconies and small spaces.",
        'herb': "🌿 **Herbs**: Basil, parsley, mint easy to grow. Need good drainage. Harvest regularly. Most do well in SA climate."
    };
    
    // Find matching topic
    for (const [topic, answer] of Object.entries(gardeningKnowledge)) {
        if (lowerQuery.includes(topic)) {
            return {
                answer: answer,
                source: 'gardening_knowledge_base',
                title: `Gardening Tips: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`
            };
        }
    }
    
    // General gardening guidance
    return {
        answer: "🌱 **Gardening Assistant**: I specialize in vegetable gardening advice for South African conditions! Try asking about:\n• Specific plants: tomatoes, carrots, lettuce, spinach\n• Soil preparation and composting\n• Watering and fertilizing schedules\n• Pest control methods\n• Seasonal planting for your region\n\nExample: 'How to grow tomatoes in containers' or 'Best vegetables for beginners in South Africa'",
        source: 'general_guidance',
        title: 'Gardening Help'
    };
}

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    let url;
    try {
        url = new URL(req.url, `http://${req.headers.host}`);
    } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid URL' }));
        return;
    }

    if (url.pathname === '/search') {
        const query = url.searchParams.get('q');
        
        if (!query) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing query parameter "q"' }));
            return;
        }

        // Add gardening context to improve results
        const gardeningQuery = `gardening ${query} South Africa`;
        
        fetchGoogleSearch(gardeningQuery, (err, data) => {
            res.setHeader('Content-Type', 'application/json');
            if (err) {
                console.error('❌ Google API Error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ 
                    error: 'Google Search API error', 
                    details: err.toString() 
                }));
            } else if (data.error) {
                console.error('❌ Google API Error:', data.error);
                res.statusCode = 400;
                res.end(JSON.stringify({ 
                    error: 'Google API returned error',
                    details: data.error.message 
                }));
            } else {
                const answer = extractGardeningAnswer(data, query);
                console.log(`✅ Answer source: ${answer.source}`);
                
                res.end(JSON.stringify({
                    answer: answer.answer,
                    source: answer.source,
                    title: answer.title,
                    link: answer.link,
                    displayLink: answer.displayLink,
                    search_results_count: data.items ? data.items.length : 0,
                    search_time: data.searchInformation ? data.searchInformation.formattedSearchTime : '0'
                }));
            }
        });
    } else if (url.pathname === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
            status: 'healthy', 
            service: 'Google Search Gardening Proxy',
            port: PORT 
        }));
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
            error: 'Endpoint not found', 
            usage: 'Use /search?q=your+gardening+question' 
        }));
    }
});

server.listen(PORT, () => {
    console.log(`🌱 Google Search Gardening Proxy running on http://localhost:${PORT}`);
    console.log(`🔑 API Key: ${GOOGLE_API_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log(`🔍 Search Engine ID: ${SEARCH_ENGINE_ID ? '✓ Configured' : '✗ Missing - Please set SEARCH_ENGINE_ID'}`);
    console.log(`💡 Test: curl "http://localhost:${PORT}/search?q=how%20to%20grow%20tomatoes"`);
    console.log(`🏥 Health: curl "http://localhost:${PORT}/health"`);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Google Search proxy server...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});