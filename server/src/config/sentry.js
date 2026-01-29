import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Initializes Sentry for error tracking and performance monitoring
 */
export const initSentry = (app) => {
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
        console.warn("[Sentry] No DSN found. Error tracking is disabled.");
        return;
    }

    Sentry.init({
        dsn: dsn,
        integrations: [
            nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
        environment: process.env.NODE_ENV || 'development',
    });

    // The Sentry request handler must be the first middleware on the app
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    console.log("[Sentry] Initialized successfully");
};

/**
 * The Sentry error handler must be before any other error middleware and after all controllers
 */
export const registerSentryErrorHandler = (app) => {
    if (process.env.SENTRY_DSN) {
        app.use(Sentry.Handlers.errorHandler());
    }
};

export default {
    initSentry,
    registerSentryErrorHandler
};
