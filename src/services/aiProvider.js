const API_KEY = import.meta.env.VITE_SAMBANOVA_API_KEY;
const hasValidKey = API_KEY && API_KEY.length > 10;
const BASE_URL = "https://api.sambanova.ai/v1/chat/completions";

/**
 * Unified AI Provider to handle sacred temple intelligence using SambaNova Cloud (OpenAI Compatible)
 * Function name preserved as callGroqAi to maintain compatibility with existing sector mission hubs.
 */
export const callGroqAi = async ({ systemPrompt, userContext, userPrompt, model = "Meta-Llama-3.1-70B-Instruct" }, retries = 2) => {
    if (!hasValidKey) {
        console.error("AI CRITICAL: SambaNova Provider failed to initialize. VITE_SAMBANOVA_API_KEY is missing from .env.");
        throw new Error("Sacred Grid connection failed: AI Provider not initialized. Please verify VITE_SAMBANOVA_API_KEY in your environment.");
    }

    try {
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `${userContext}\n\nUSER QUERY: ${userPrompt}` }
                ],
                model: model,
                temperature: 0.5,
                max_tokens: 2048,
                top_p: 1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { status: response.status, data: errorData };
        }

        const completion = await response.json();
        const responseContent = completion.choices[0]?.message?.content;
        return JSON.parse(responseContent);
    } catch (error) {
        // Handle Rate Limits (429) or other transient errors
        if (error.status === 429 && retries > 0) {
            console.warn(`SambaNova Rate Limited. Retrying... (${retries} left).`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Keep using the same model as SambaNova limits are typically higher than Groq
            return callGroqAi({ systemPrompt, userContext, userPrompt, model }, retries - 1);
        }
        console.error("SambaNova AI Service Error:", error);
        throw error;
    }
};

export const isGroqEnabled = () => hasValidKey;
