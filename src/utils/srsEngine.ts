
import { Flashcard } from '../store/useStore';

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsResult {
    interval: number;
    ease: number;
    dueDate: string;
    state: 'new' | 'learning' | 'review' | 'relearning';
}

/**
 * Simplified SRS Scheduling Logic (FSRS/SM-2 inspired)
 */
export function calculateNextReview(card: Flashcard, rating: Rating): SrsResult {
    let { interval = 0, ease = 2.5, state = 'new' } = card;

    // Default starting interval if it's new
    if (state === 'new') {
        if (rating === 'again') {
            return {
                interval: 0, // Review same session
                ease: 2.5,
                dueDate: new Date().toISOString(),
                state: 'learning'
            };
        }
        if (rating === 'hard') {
            return {
                interval: 1,
                ease: 2.3,
                dueDate: addDays(new Date(), 1).toISOString(),
                state: 'review'
            };
        }
        if (rating === 'good') {
            return {
                interval: 1,
                ease: 2.5,
                dueDate: addDays(new Date(), 1).toISOString(),
                state: 'review'
            };
        }
        if (rating === 'easy') {
            return {
                interval: 4,
                ease: 2.7,
                dueDate: addDays(new Date(), 4).toISOString(),
                state: 'review'
            };
        }
    }

    // Existing cards in review or learning
    if (rating === 'again') {
        interval = 1;
        ease = Math.max(1.3, ease - 0.2);
        state = 'relearning';
    } else if (rating === 'hard') {
        interval = Math.max(1, Math.floor(interval * 1.2));
        ease = Math.max(1.3, ease - 0.15);
        state = 'review';
    } else if (rating === 'good') {
        interval = Math.max(1, Math.floor(interval * ease));
        state = 'review';
    } else if (rating === 'easy') {
        interval = Math.max(1, Math.floor(interval * ease * 1.3));
        ease = Math.min(5.0, ease + 0.15);
        state = 'review';
    }

    const dueDate = addDays(new Date(), interval);

    return {
        interval,
        ease,
        dueDate: dueDate.toISOString(),
        state
    };
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
