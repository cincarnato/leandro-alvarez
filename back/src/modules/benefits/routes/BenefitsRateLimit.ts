import type {preHandlerHookHandler} from 'fastify';

// Per-process/IP fixed window. No timer, unbounded map, proxy headers or dependency.
export function benefitsRateLimit(max: number, windowMs = 60_000): preHandlerHookHandler {
    const entries = new Map<string, {count: number; expires: number}>();
    let nextCleanup = 0;
    return async (request, reply) => {
        const now = Date.now();
        if (now >= nextCleanup) {
            for (const [ip, entry] of entries) if (entry.expires <= now) entries.delete(ip);
            nextCleanup = now + Math.min(windowMs, 1000);
        }
        let entry = entries.get(request.ip);
        if (!entry || entry.expires <= now) {
            if (entries.size >= 10_000 && !entry) return reply.code(429).send({error: 'rate_limit'});
            entry = {count: 0, expires: now + windowMs};
            entries.set(request.ip, entry);
        }
        if (++entry.count > max) {
            return reply.header('Retry-After', Math.ceil((entry.expires - now) / 1000)).code(429).send({error: 'rate_limit'});
        }
    };
}
