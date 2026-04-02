const { GoogleGenerativeAI } = require('@google/generative-ai');

const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Gemini API Key is missing on the server.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Robust model fallback chain based on available models for the key
        const modelNames = [
            "gemini-1.5-flash", 
            "gemini-2.0-flash", 
            "gemini-flash-latest", 
            "gemini-pro-latest",
            "gemini-1.5-pro"
        ];

        let model;
        let lastError = null;

        for (const modelName of modelNames) {
            try {
                model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: "You are a highly knowledgeable and friendly AI assistant for farmers using the FarmGuide app. Your goal is to provide practical, accurate, and easy-to-understand advice on crop cultivation, soil management, disease treatment, weather impacts, and agricultural market trends. Keep your answers concise, actionable, and formatted nicely. Do not answer questions completely unrelated to agriculture or the FarmGuide app features."
                });

                // Test start chat
                const formattedHistory = (history || []).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

                const chat = model.startChat({ 
                    history: formattedHistory,
                    generationConfig: { maxOutputTokens: 500, temperature: 0.5 }
                });

                const result = await chat.sendMessage(message);
                const responseText = result.response.text();
                return res.json({ success: true, response: responseText });

            } catch (e) {
                lastError = e;
                console.warn(`Model ${modelName} failed:`, e.message);
                if (e.message.includes('429') || e.message.includes('quota')) continue;
                if (e.message.includes('404')) continue;
                break; // If it's a structural error (like bad history), stop trying models
            }
        }

        // If we reach here, all fallbacks failed
        let errorMsg = "The AI server is currently busy or out of credits. Please try again later.";
        if (lastError?.message.includes('429')) errorMsg = "Daily AI usage limit reached. Please try again tomorrow or refresh your API key.";
        if (lastError?.message.includes('quota')) errorMsg = "Gemini API Quota Exceeded. Please check your Google AI Studio billing.";

        res.status(500).json({ success: false, message: errorMsg });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ success: false, message: "AI Assistant is currently offline. Please try again later." });
    }
};

module.exports = { handleChat };

module.exports = { handleChat };
