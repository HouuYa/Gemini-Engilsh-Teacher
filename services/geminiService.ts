
import { GoogleGenAI } from '@google/genai';
import type { BriefingData, FeedbackData, TranscriptItem } from '../types';
import { retryWithBackoff } from '../utils/apiHelpers';

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
    return retryWithBackoff(async () => {
        const ai = getAi(apiKey);
        const briefingPrompt = `Find a unique, recent news article (last 3 months) on IT, AI, finance, or self-development. B1-B2 level. Return JSON with a valid URL and accurate date:
{
  "topic": "Title (EN)\\n(KR)",
  "article": {"title": "...", "source": "...", "publication_date": "YYYY-MM-DD"},
  "summary": {"en": "...", "ko": "..."},
  "key_insights": [{"en": "...", "ko": "..."}, {"en": "...", "ko": "..."}, {"en": "...", "ko": "..."}],
  "implications": {"en": "...", "ko": "..."},
  "vocabulary": [{"word": "...", "meaning": "...", "example": "..."}, {"word": "...", "meaning": "...", "example": "..."}, {"word": "...", "meaning": "...", "example": "..."}, {"word": "...", "meaning": "...", "example": "..."}, {"word": "...", "meaning": "...", "example": "..."}],
  "discussion_questions": ["...", "...", "...", "...", "..."],
  "url": "..."
}`;

        const response = await ai.models.generateContent({
            model,
            contents: briefingPrompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.7, // Token 최적화
                candidateCount: 1,
            },
        });

        return parseJsonResponse<BriefingData>(response.text, 'briefing');
    });
};

export const getFeedback = async (transcript: TranscriptItem[], model: string, apiKey: string): Promise<FeedbackData> => {
    return retryWithBackoff(async () => {
        const ai = getAi(apiKey);
        const transcriptText = transcript.map(t => `${t.speaker === 'user' ? 'User' : 'Alex'}: ${t.text}`).join('\n');

        const feedbackPrompt = `Analyze this conversation and provide comprehensive, objective feedback in JSON:

${transcriptText}

Return:
{
  "overall_assessment": "...",
  "praise_points": ["...", "..."],
  "good_expressions": [{"expression": "...", "reason": "...", "example": "..."}],
  "improvement_suggestions": {
    "grammar": [{"original": "...", "corrected": "...", "reason": "..."}],
    "vocabulary": [{"original": "...", "corrected": "...", "reason": "..."}],
    "fluency": [{"suggestion": "...", "reason": "..."}]
  }
}`;

        const response = await ai.models.generateContent({
            model,
            contents: feedbackPrompt,
            config: {
                temperature: 0.7, // Token 최적화
                candidateCount: 1,
            },
        });

        return parseJsonResponse<FeedbackData>(response.text, 'feedback');
    });
};

export const getShadowingSentences = async (feedback: FeedbackData, model: string, apiKey: string): Promise<string[]> => {
    return retryWithBackoff(async () => {
        const ai = getAi(apiKey);
        const sentencePrompt = `From the 'corrected' sentences in the grammar/vocabulary feedback below, select the 3 most important for shadowing practice.
${JSON.stringify(feedback.improvement_suggestions)}

Return a JSON array of strings: ["sentence 1", "sentence 2", "sentence 3"]`;

        const response = await ai.models.generateContent({
            model,
            contents: sentencePrompt,
            config: {
                temperature: 0.5, // 더 일관된 선택을 위해 낮은 temperature
                candidateCount: 1,
            },
        });

        return parseJsonResponse<string[]>(response.text, 'shadowing sentences');
    });
};
