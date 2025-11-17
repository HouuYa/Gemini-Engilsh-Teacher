
import { GoogleGenAI } from '@google/genai';
import type { BriefingData, FeedbackData, TranscriptItem } from '../types';

const getAi = (apiKey: string) => new GoogleGenAI({ apiKey });

const parseJsonResponse = <T,>(text: string, typeName: string): T => {
    try {
        const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error(`Failed to parse ${typeName} JSON:`, e);
        console.error("Raw text from API:", text);
        throw new Error(`The AI returned an invalid ${typeName} format.`);
    }
};

export const checkApiStatus = async (model: string, apiKey: string): Promise<{ok: boolean; message: string;}> => {
    try {
        if (!apiKey) {
            return { ok: false, message: 'Gemini API key is not provided.' };
        }
        const ai = getAi(apiKey);
        await ai.models.generateContent({
            model,
            contents: 'test',
        });
        return { ok: true, message: 'Gemini API connection successful.' };
    } catch (e: any) {
        console.error("API Status Check Failed:", e);
        let message = 'An unknown error occurred while verifying the key.';
        if (e.message) {
            if (e.message.includes('API key not valid')) {
                message = 'Your Gemini API key is not valid. Please check it and try again.';
            } else if (e.message.includes('403')) {
                message = 'Permission denied. Please check your API key permissions.';
            } else {
                 message = 'Could not connect to the Gemini API. Please check the console for more details.';
            }
        }
        return { ok: false, message };
    }
};

export const fetchBriefing = async (model: string, apiKey: string): Promise<BriefingData> => {
    const ai = getAi(apiKey);
    const briefingPrompt = `You are Alex, an intelligent English discussion partner at the CEFR B1-B2 level. Your task is to find a recent English news article (published within the last 3 months) using Google Search on a diverse and new topic (e.g., IT, AI, finance, economic trends, self-development, or in-depth interviews with figures like Peter Thiel or Elon Musk). After finding and verifying the URL, generate a briefing in the following JSON format. Ensure all English text is at a B1-B2 level. Provide both English and Korean for the specified fields. Do not include markdown formatting in the JSON output.

    {
      "topic": "A concise title for the topic, including both an English version and a Korean translation on a new line. e.g., The Future of AI in Healthcare\\n(헬스케어 분야 AI의 미래)",
      "article": { "title": "...", "source": "...", "publication_date": "YYYY-MM-DD" },
      "summary": { "en": "...", "ko": "..." },
      "key_insights": [
        { "en": "...", "ko": "..." },
        { "en": "...", "ko": "..." },
        { "en": "...", "ko": "..." }
      ],
      "implications": { "en": "...", "ko": "..." },
      "vocabulary": [
        { "word": "...", "meaning": "...", "example": "..." },
        { "word": "...", "meaning": "...", "example": "..." },
        { "word": "...", "meaning": "...", "example": "..." },
        { "word": "...", "meaning": "...", "example": "..." },
        { "word": "...", "meaning": "...", "example": "..." }
      ],
      "discussion_questions": ["...", "...", "...", "...", "..."],
      "url": "..."
    }
    
    Find a different topic than any previous ones. The URL must be the full, valid, and unchanged URL found via search. The publication_date must be accurate.`;

    const response = await ai.models.generateContent({
        model,
        contents: briefingPrompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    return parseJsonResponse<BriefingData>(response.text, 'briefing');
};

export const getFeedback = async (transcript: TranscriptItem[], model: string, apiKey: string): Promise<FeedbackData> => {
    const ai = getAi(apiKey);
    const transcriptText = transcript.map(t => `${t.speaker === 'user' ? 'User' : 'Alex'}: ${t.text}`).join('\n');
    
    const feedbackPrompt = `You are Alex, an intelligent English discussion partner. Analyze the following conversation transcript. Provide comprehensive and objective feedback based on the user's performance. Structure your feedback in the exact JSON format below.

    **Conversation Transcript:**
    ${transcriptText}

    **Required JSON Output Format:**
    {
      "overall_assessment": "...",
      "praise_points": ["...", "..."],
      "good_expressions": [
        { "expression": "...", "reason": "...", "example": "..." }
      ],
      "improvement_suggestions": {
        "grammar": [
          { "original": "...", "corrected": "...", "reason": "..." }
        ],
        "vocabulary": [
          { "original": "...", "corrected": "...", "reason": "..." }
        ],
        "fluency": [
          { "suggestion": "...", "reason": "..." }
        ]
      }
    }`;

    const response = await ai.models.generateContent({
        model,
        contents: feedbackPrompt
    });

    return parseJsonResponse<FeedbackData>(response.text, 'feedback');
};

export const getShadowingSentences = async (feedback: FeedbackData, model: string, apiKey: string): Promise<string[]> => {
    const ai = getAi(apiKey);
    const sentencePrompt = `You are Alex, an English tutor. From the 'corrected' sentences in the 'grammar' and 'vocabulary' sections of the feedback JSON below, select the 3 most important and impactful sentences for the user to practice for shadowing. Return them as a JSON array of strings.

    **Feedback JSON:**
    ${JSON.stringify(feedback.improvement_suggestions)}
    
    **Required JSON Output Format:**
    ["sentence 1", "sentence 2", "sentence 3"]`;

    const response = await ai.models.generateContent({
        model,
        contents: sentencePrompt
    });
    
    return parseJsonResponse<string[]>(response.text, 'shadowing sentences');
};
