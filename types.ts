
export type Step = 1 | 2 | 3 | 4 | 5;
export type LiveStatus = 'idle' | 'connecting' | 'listening' | 'speaking';

export interface BriefingData {
  topic: string;
  article: {
    title: string;
    source: string;
    publication_date: string;
  };
  summary: {
    en: string;
    ko: string;
  };
  key_insights: Array<{
    en: string;
    ko: string;
  }>;
  implications: {
    en: string;
    ko: string;
  };
  vocabulary: Array<{
    word: string;
    meaning: string;
    example: string;
  }>;
  discussion_questions: string[];
  url: string;
}

export interface FeedbackData {
    overall_assessment: string;
    praise_points: string[];
    good_expressions: Array<{
        expression: string;
        reason: string;
        example: string;
    }>;
    improvement_suggestions: {
        grammar: Array<{
            original: string;
            corrected: string;
            reason: string;
        }>;
        vocabulary: Array<{
            original: string;
            corrected: string;
            reason: string;
        }>;
        fluency: Array<{
            suggestion: string;
            reason: string;
        }>;
    }
}

export interface TranscriptItem {
    speaker: 'user' | 'alex';
    text: string;
}
