/**
 * Strategy Pattern interface for sentiment analysis.
 * Any new analyzer (ML-based, API-based) can implement this interface.
 */
export interface ISentimentAnalyzer {
    analyze(text: string): number; // Returns score 1-5
}
