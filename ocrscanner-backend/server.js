const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Ollama API Streaming Function
async function queryOllamaModelStream(prompt, modelName = "qwen2.5:0.5b", serverUrl = "http://127.0.0.1:11434") {
    const url = `${serverUrl}/api/generate`;
    const payload = { model: modelName, prompt: prompt };
    try {
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'stream'
        });

        let streamedOutput = '';

        return new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => {
                try {
                    const data = JSON.parse(chunk.toString());
                    const chunkText = data.response || '';
                    streamedOutput += chunkText;
                    process.stdout.write(chunkText);  // Show live stream in terminal
                } catch (err) {
                    console.error("\nError decoding stream:", err);
                }
            });

            response.data.on('end', () => {
                console.log("\nStream complete.");
                resolve(streamedOutput);
            });

            response.data.on('error', (err) => {
                console.error("\nStream error:", err);
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error querying Ollama model:', error.message);
        throw new Error("Request to Ollama API failed.");
    }
}

// API Endpoint for Angular
app.post('/query', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await queryOllamaModelStream(prompt);
        res.send(response);
    } catch (error) {
        res.status(500).send('Error generating response from Ollama.');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
});