package com.revhire.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import java.security.Key;

/**
 * JWT Gateway Filter.
 * Validates Bearer token, extracts userId + role, forwards them as
 * X-User-Id and X-User-Role headers to downstream microservices.
 */
@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    public JwtAuthFilter() { super(Config.class); }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                return onError(exchange.getResponse(), "Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(getSigningKey()).build()
                        .parseClaimsJws(token).getBody();

                String userId  = claims.get("userId", String.class);
                String role    = claims.get("role",   String.class);
                String email   = claims.getSubject();

                ServerHttpRequest modified = request.mutate()
                        .header("X-User-Email", email != null ? email : "")
                        .header("X-User-Id",    userId != null ? userId : "")
                        .header("X-User-Role",  role   != null ? role   : "")
                        .build();

                logger.debug("JWT validated — user: {}, role: {}", email, role);
                return chain.filter(exchange.mutate().request(modified).build());

            } catch (ExpiredJwtException e) {
                logger.error("JWT expired: {}", e.getMessage());
                return onError(exchange.getResponse(), "Token expired");
            } catch (JwtException e) {
                logger.error("JWT invalid: {}", e.getMessage());
                return onError(exchange.getResponse(), "Invalid token");
            }
        };
    }

    private Mono<Void> onError(ServerHttpResponse response, String msg) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        var buf = response.bufferFactory()
                .wrap(("{\"error\":\"" + msg + "\",\"status\":401}").getBytes());
        return response.writeWith(Mono.just(buf));
    }

    private Key getSigningKey() { return Keys.hmacShaKeyFor(jwtSecret.getBytes()); }

    public static class Config {}
}
