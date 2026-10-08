// Tokens and operator-visible coupons must not enter caches or referrer headers.
export const benefitsResponseHeaders = async (_request, reply, payload) => {
    reply.header('Cache-Control', 'no-store');
    reply.header('Referrer-Policy', 'no-referrer');
    return payload;
};
