// Per-process/IP fixed window. No timer, unbounded map, proxy headers or dependency.
export function benefitsRateLimit(max, windowMs = 60000) {
    const entries = new Map();
    let nextCleanup = 0;
    return async (request, reply) => {
        const now = Date.now();
        if (now >= nextCleanup) {
            for (const [ip, entry] of entries)
                if (entry.expires <= now)
                    entries.delete(ip);
            nextCleanup = now + Math.min(windowMs, 1000);
        }
        let entry = entries.get(request.ip);
        if (!entry || entry.expires <= now) {
            if (entries.size >= 10000 && !entry)
                return reply.code(429).send({ error: 'rate_limit' });
            entry = { count: 0, expires: now + windowMs };
            entries.set(request.ip, entry);
        }
        if (++entry.count > max) {
            return reply.header('Retry-After', Math.ceil((entry.expires - now) / 1000)).code(429).send({ error: 'rate_limit' });
        }
    };
}
