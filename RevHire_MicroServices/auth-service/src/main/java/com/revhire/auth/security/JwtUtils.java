package com.revhire.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.*;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    @Value("${jwt.secret}")      private String jwtSecret;
    @Value("${jwt.expiration}")  private int    jwtExpiration;

    private Key getSigningKey() { return Keys.hmacShaKeyFor(jwtSecret.getBytes()); }

    public String generateToken(Authentication authentication) {
        UserDetailsImpl up = (UserDetailsImpl) authentication.getPrincipal();
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", String.valueOf(up.getId()));
        claims.put("role",   up.getRole().name());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(up.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try { Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token); return true; }
        catch (JwtException | IllegalArgumentException e) { logger.error("JWT error: {}", e.getMessage()); }
        return false;
    }
}
