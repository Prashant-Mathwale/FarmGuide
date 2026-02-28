const { GoogleGenerativeAI } = require('@google/generative-ai');

const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Gemini API Key is missing on the server.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the recommended fast model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "You are a highly knowledgeable and friendly AI assistant for farmers using the FarmGuide app. Your goal is to provide practical, accurate, and easy-to-understand advice on crop cultivation, soil management, disease treatment, weather impacts, and agricultural market trends. Keep your answers concise, actionable, and formatted nicely. Do not answer questions completely unrelated to agriculture or the FarmGuide app features."
        });

        // Convert the frontend history format to the Gemini SDK format
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.5,
            }
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({ success: true, response: responseText });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate response. Please try again.' });
    }
};

module.exports = { handleChat };
