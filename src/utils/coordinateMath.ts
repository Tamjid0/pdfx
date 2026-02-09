/**
 * Utilities for calculating geometric intersections and coordinate mapping.
 */

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Checks if two rectangles intersect.
 */
export function isIntersecting(rect1: Rect, rect2: Rect): boolean {
    return !(
        rect1.x > rect2.x + rect2.width ||
        rect1.x + rect1.width < rect2.x ||
        rect1.y > rect2.y + rect2.height ||
        rect1.y + rect1.height < rect2.y
    );
}

/**
 * Normalizes mouse coordinates to percentage-based coordinates relative to a container.
 */
export function getRelativeRect(start: { x: number, y: number }, end: { x: number, y: number }, container: DOMRect): Rect {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    return {
        x: ((minX - container.left) / container.width) * 100,
        y: ((minY - container.top) / container.height) * 100,
        width: ((maxX - minX) / container.width) * 100,
        height: ((maxY - minY) / container.height) * 100
    };
}
