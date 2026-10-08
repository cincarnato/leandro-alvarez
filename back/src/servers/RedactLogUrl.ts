// Log no query values: even filters/redirect URLs can contain coupon tokens.
// Match route segments, not token syntax, so invalid and encoded tokens are safe.
export function redactLogUrl(url: unknown): string | undefined {
    if (typeof url !== 'string') return undefined;
    const path = url.split(/[?#]/, 1)[0];
    const segments = path.split('/');
    const decode = (segment: string) => {
        try { return decodeURIComponent(segment).toLowerCase(); }
        catch { return segment.toLowerCase(); }
    };
    for (let index = 0; index < segments.length; index++) {
        // The same server also serves SPA coupon links.
        if (decode(segments[index]) === 'coupons' && segments[index + 1]) segments[index + 1] = '[REDACTED]';
        if (decode(segments[index]) !== 'api') continue;
        const next = decode(segments[index + 1] ?? '');
        const claimsIndex = next === 'public' ? index + 2 : index + 1;
        if (decode(segments[claimsIndex] ?? '') === 'benefit-claims' && segments[claimsIndex + 1]) {
            segments[claimsIndex + 1] = '[REDACTED]';
        }
    }
    return segments.join('/') + (url.includes('?') ? '?[REDACTED]' : '');
}
