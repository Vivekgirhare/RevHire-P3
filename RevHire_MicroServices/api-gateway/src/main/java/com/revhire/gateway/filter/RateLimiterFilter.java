package com.revhire.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory Token Bucket Rate Limiter (no Redis required).
 *
 * Each client IP gets its own bucket:
 *   - Capacity  : 40 requests (burst)
 *   - Refill    : 20 tokens per second
 *
 * This satisfies the Spring Cloud rate-limiting requirement
 * without an external Redis dependency.
 */
@Component
public class RateLimiterFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(RateLimiterFilter.class);

    private static final int    REPLENISH_RATE   = 20;   // tokens added per second
    private static final int    BURST_CAPACITY   = 40;   // max tokens (bucket size)
    private static final long   REFILL_INTERVAL  = 1000L; // ms between refills

    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = getClientIp(exchange);
        TokenBucket bucket = buckets.computeIfAbsent(clientIp, k -> new TokenBucket());

        if (bucket.tryConsume()) {
            logger.debug("Rate limit OK  — IP: {}  tokens remaining: {}", clientIp, bucket.getTokens());
            return chain.filter(exchange);
        } else {
            logger.warn("Rate limit HIT — IP: {} exceeded {} req/s", clientIp, REPLENISH_RATE);
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            byte[] body = "{\"error\":\"Too many requests. Please slow down.\",\"status\":429}".getBytes();
            var buf = exchange.getResponse().bufferFactory().wrap(body);
            return exchange.getResponse().writeWith(Mono.just(buf));
        }
    }

    private String getClientIp(ServerWebExchange exchange) {
        String forwarded = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        var addr = exchange.getRequest().getRemoteAddress();
        return addr != null ? addr.getAddress().getHostAddress() : "unknown";
    }

    @Override
    public int getOrder() {
        return -100; // run before all other filters
    }

    // ── Token Bucket ──────────────────────────────────────────────────────────

    private static class TokenBucket {
        private final AtomicInteger tokens   = new AtomicInteger(BURST_CAPACITY);
        private final AtomicLong    lastRefill = new AtomicLong(System.currentTimeMillis());

        boolean tryConsume() {
            refill();
            int current;
            do {
                current = tokens.get();
                if (current <= 0) return false;
            } while (!tokens.compareAndSet(current, current - 1));
            return true;
        }

        int getTokens() { return tokens.get(); }

        private void refill() {
            long now  = System.currentTimeMillis();
            long last = lastRefill.get();
            long elapsed = now - last;
            if (elapsed >= REFILL_INTERVAL) {
                int toAdd = (int) ((elapsed / REFILL_INTERVAL) * REPLENISH_RATE);
                if (toAdd > 0 && lastRefill.compareAndSet(last, now)) {
                    int updated = Math.min(BURST_CAPACITY, tokens.get() + toAdd);
                    tokens.set(updated);
                }
            }
        }
    }
}
