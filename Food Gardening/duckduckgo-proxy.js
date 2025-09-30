// Enhanced DuckDuckGo proxy for gardening chatbot
const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3001;

function fetchDuckDuckGo(query, callback) {
    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
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

function extractUsefulAnswer(data, originalQuery) {
    // Priority order for answers
    if (data.Answer && data.Answer.length > 10) {
        return { answer: data.Answer, source: 'direct_answer' };
    }
    
    if (data.AbstractText && data.AbstractText.length > 10) {
        return { answer: data.AbstractText, source: 'abstract' };
    }
    
    if (data.Definition && data.Definition.length > 10) {
        return { answer: data.Definition, source: 'definition' };
    }
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        // Get the first meaningful related topic
        const firstTopic = data.RelatedTopics[0];
        if (firstTopic.Text && firstTopic.Text.length > 10) {
            return { answer: firstTopic.Text, source: 'related_topic' };
        }
    }
    
    if (data.Results && data.Results.length > 0) {
        const firstResult = data.Results[0];
        if (firstResult.Text && firstResult.Text.length > 10) {
            return { answer: firstResult.Text, source: 'result' };
        }
    }
    
    // If no good answer found, provide helpful gardening guidance
    const gardeningTips = {
        'plant': "I can help with planting advice! Try asking about specific plants like 'How to plant tomatoes' or 'When to plant carrots in South Africa'.",
        'grow': "For growing tips, ask about specific plants like 'How to grow lettuce' or 'Best conditions for growing peppers'.",
        'soil': "Ask about soil types like 'Best soil for vegetables' or 'How to improve garden soil'.",
        'water': "Ask about watering specific plants like 'How often to water tomatoes' or 'Watering requirements for herbs'.",
        'default': "I specialize in gardening questions! Try asking about specific plants, soil, planting times, or gardening techniques. Example: 'How to grow tomatoes in containers' or 'Best vegetables for beginners'."
    };
    
    const queryLower = originalQuery.toLowerCase();
    let tip = gardeningTips.default;
    
    if (queryLower.includes('plant')) tip = gardeningTips.plant;
    else if (queryLower.includes('grow')) tip = gardeningTips.grow;
    else if (queryLower.includes('soil')) tip = gardeningTips.soil;
    else if (queryLower.includes('water')) tip = gardeningTips.water;
    
    return { 
        answer: `🌱 ${tip}`,
        source: 'gardening_guide'
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

    if (url.pathname === '/duckduckgo') {
        const query = url.searchParams.get('q');
        
        if (!query) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing query parameter "q"' }));
            return;
        }

        console.log(`🔍 Searching for: ${query}`);
        
        fetchDuckDuckGo(query, (err, answer) => {
            res.setHeader('Content-Type', 'application/json');
            if (err) {
                console.error('❌ API Error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ 
                    error: 'DuckDuckGo API error', 
                    details: err.toString() 
                }));
            } else {
                const usefulAnswer = extractUsefulAnswer(answer, query);
                console.log(`✅ Answer source: ${usefulAnswer.source}`);
                
                res.end(JSON.stringify({
                    answer: usefulAnswer.answer,
                    source: usefulAnswer.source,
                    heading: answer.Heading || '',
                    hasAbstract: !!answer.AbstractText,
                    hasAnswer: !!answer.Answer,
                    relatedCount: answer.RelatedTopics ? answer.RelatedTopics.length : 0,
                    raw: answer
                }));
            }
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Endpoint not found. Use /duckduckgo?q=your+query' }));
    }
});

server.listen(PORT, () => {
    console.log(`🌱 Enhanced DuckDuckGo proxy running on http://localhost:${PORT}`);
    console.log(`📝 Now with better gardening question handling!`);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down proxy server...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});