package com.JustEat.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String SECRET;

    @Value("${jwt.expiration}")
    private long EXPIRATION;

    // Returns the HMAC signing key derived from the configured secret
    private SecretKey getSigningKey(){
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // Builds a signed JWT containing the user's ID and role, expiring after the configured duration
    public String generateToken(UUID userId, String role){
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role",role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }
    // Extracts the user UUID stored in the token's subject claim
    public UUID extractUserId(String token){
        return UUID.fromString(getClaims(token).getSubject());
    }
    // Extracts the role string stored in the token's custom claim
    public String extractRole(String token){
        return getClaims(token).get("role",String.class);
    }

    // Parses the token and returns its claims; throws if the token is invalid or tampered
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    // Returns true if the token can be parsed and verified successfully
    public  boolean isTokenValid(String token){
        try{
            getClaims(token);
            return true;
        }catch(JwtException | IllegalArgumentException e){
            return false;
        }
    }
}
