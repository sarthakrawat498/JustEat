package com.JustEat.util;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtils {
    // Extracts the authenticated user's UUID from the current Spring Security context
    public static UUID getCurrentUserId(){
        return UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
    }
}
