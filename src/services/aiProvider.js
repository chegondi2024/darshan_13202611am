import Groq from "groq-sdk";

const SAMBANOVA_API_KEY = import.meta.env.VITE_SAMBANOVA_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const hasSambaNovaKey = SAMBANOVA_API_KEY && SAMBANOVA_API_KEY.length > 10;
const hasGroqKey = GROQ_API_KEY && GROQ_API_KEY.length > 10;

const BASE_URL = "https://api.sambanova.ai/v1/chat/completions";

// Initialize Groq as a fallback (Browser safe)
const groq = hasGroqKey ? new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
}) : null;

export const callGroqAi = async ({ systemPrompt, userContext, userPrompt, model = "Meta-Llama-3.3-70B-Instruct" }, retries = 2) => {
    if (!hasSambaNovaKey && !hasGroqKey) {
        console.error("AI CRITICAL: Neither SambaNova nor Groq Provider keys found.");
        throw new Error("Sacred Grid connection failed: AI Providers not initialized.");
    }

    try {
        if (hasSambaNovaKey) {
            console.log(`[AI Network] Attempting connection via SambaNova (${model})...`);
            try {
                const response = await fetch(BASE_URL, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
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
                        top_p: 1
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw { status: response.status, data: errorData, source: 'SambaNova' };
                }

                const completion = await response.json();
                let content = completion.choices[0]?.message?.content || "";
                
                // Extra JSON extraction safety if model ignores JSON constraints
                if (!content.trim().startsWith("{")) {
                     const match = content.match(/\{[\s\S]*\}/);
                     if (match) content = match[0];
                }
                return JSON.parse(content);
            } catch (error) {
                // Determine if it was a CORS error (TypeError: Failed to fetch)
                if (error instanceof TypeError && error.message.includes("fetch")) {
                     console.warn("[AI Network] SambaNova CORS/Network block detected. Falling back to Groq.");
                     throw new Error("SambaNova CORS Block");
                }
                throw error;
            }
        } else {
            throw new Error("SambaNova Key Missing");
        }
    } catch (error) {
        // HYBRID REDUNDANCY: Fallback to Groq SDK
        console.warn(`[AI Network] Primary Link Failed. Initiating Sacred Failover to Groq. Origin:`, error);
        
        if (groq) {
             try {
                // If the connection failed due to rate limits or CORS, we use Groq
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `${userContext}\n\nUSER QUERY: ${userPrompt}` }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.5,
                    max_tokens: 2048,
                    top_p: 1,
                    stream: false,
                    response_format: { type: "json_object" }
                });
                
                const responseContent = completion.choices[0]?.message?.content;
                return JSON.parse(responseContent);
             } catch (groqError) {
                  if (groqError.status === 429 && retries > 0) {
                      console.warn(`[AI Network] Groq Rate Limited. Retrying... (${retries} left).`);
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      // Swap to a faster, smaller model with a separate rate limit pool to guarantee delivery
                      return callGroqAi({ systemPrompt, userContext, userPrompt, model: "llama-3.1-8b-instant" }, retries - 1);
                  }
                  throw groqError;
             }
        }
        
        throw error;
    }
};

export const isGroqEnabled = () => hasSambaNovaKey || hasGroqKey;
