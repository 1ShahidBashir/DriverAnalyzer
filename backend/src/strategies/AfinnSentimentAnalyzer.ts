import { ISentimentAnalyzer } from './ISentimentAnalyzer';

/**
 * AFINN-165 inspired rule-based sentiment analyzer.
 * Uses a dictionary of words with sentiment scores from -5 to +5.
 * Normalizes the aggregate to a 1-5 scale.
 */
export class AfinnSentimentAnalyzer implements ISentimentAnalyzer {
    private readonly dictionary: Record<string, number> = {
        // Strongly positive (+4 to +5)
        'excellent': 5, 'outstanding': 5, 'amazing': 5, 'fantastic': 5,
        'wonderful': 5, 'superb': 5, 'brilliant': 4, 'awesome': 4,
        'love': 4, 'perfect': 5, 'exceptional': 5, 'delightful': 4,

        // Positive (+2 to +3)
        'good': 3, 'great': 3, 'nice': 2, 'happy': 3,
        'pleased': 2, 'comfortable': 2, 'friendly': 3, 'helpful': 3,
        'professional': 3, 'polite': 2, 'clean': 2, 'safe': 2,
        'smooth': 2, 'punctual': 3, 'reliable': 3, 'courteous': 3,
        'pleasant': 2, 'enjoy': 3, 'recommend': 3, 'satisfied': 3,

        // Mildly positive (+1)
        'okay': 1, 'fine': 1, 'decent': 1, 'adequate': 1,
        'fair': 1, 'acceptable': 1, 'average': 0,

        // Mildly negative (-1 to -2)
        'slow': -2, 'late': -2, 'delay': -2, 'wait': -1,
        'boring': -2, 'mediocre': -1, 'disappointing': -2,
        'uncomfortable': -2, 'unfriendly': -2, 'dirty': -2,
        'problem': -2, 'issue': -1, 'complaint': -2,

        // Negative (-3 to -4)
        'bad': -3, 'poor': -3, 'terrible': -4, 'horrible': -4,
        'awful': -4, 'rude': -3, 'angry': -3, 'upset': -3,
        'dangerous': -4, 'unsafe': -4, 'worst': -4, 'hate': -4,
        'disgusting': -4, 'unacceptable': -3, 'unprofessional': -3,
        'careless': -3, 'aggressive': -3, 'scary': -3,

        // Strongly negative (-5)
        'accident': -5, 'crash': -5, 'harass': -5, 'abuse': -5,
        'threat': -5, 'assault': -5, 'drunk': -5, 'intoxicated': -5,
    };

    /**
     * Analyzes text and returns a sentiment score from 1 to 5.
     * 1 = very negative, 3 = neutral, 5 = very positive.
     */
    public analyze(text: string): number {
        const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
        let totalScore = 0;
        let matchedWords = 0;

        for (const word of words) {
            if (this.dictionary[word] !== undefined) {
                totalScore += this.dictionary[word];
                matchedWords++;
            }
        }

        if (matchedWords === 0) {
            return 3; // Neutral if no sentiment words found
        }

        // Average score will be in range [-5, 5], normalize to [1, 5]
        const avgScore = totalScore / matchedWords;
        const normalized = ((avgScore + 5) / 10) * 4 + 1; // maps [-5,5] → [1,5]

        return Math.round(Math.max(1, Math.min(5, normalized)) * 10) / 10;
    }
}
