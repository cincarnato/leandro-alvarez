import type {onSendAsyncHookHandler} from 'fastify';

// Tokens and operator-visible coupons must not enter caches or referrer headers.
export const benefitsResponseHeaders: onSendAsyncHookHandler = async (_request, reply, payload) => {
    reply.header('Cache-Control', 'no-store');
    reply.header('Referrer-Policy', 'no-referrer');
    return payload;
};
