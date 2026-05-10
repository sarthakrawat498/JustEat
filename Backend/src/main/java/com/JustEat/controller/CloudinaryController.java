package com.JustEat.controller;

import com.JustEat.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class CloudinaryController {
    private final CloudinaryService cloudinaryService;
    
    @Value("${upload.max-file-size-mb:10}")
    private long maxFileSizeMB;

    @PostMapping("/image")
    @PreAuthorize("hasAnyRole('OWNER','CUSTOMER')")
    public Map<String,Object> uploadImage(@RequestParam("file") MultipartFile file){
        // Validate file is not empty
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        
        // Validate file size
        long maxSizeBytes = maxFileSizeMB * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            throw new ResponseStatusException(
                HttpStatus.PAYLOAD_TOO_LARGE, 
                String.format("File size exceeds maximum limit of %d MB", maxFileSizeMB)
            );
        }
        
        String url = cloudinaryService.uploadImage(file);
        return Map.of("url", url);
    }
}
