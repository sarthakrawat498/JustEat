package com.JustEat.controller;

import com.JustEat.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class CloudinaryController {
    private final CloudinaryService cloudinaryService;

    @PostMapping("/image")
    //@PreAuthorize("hasAnyRole('OWNER','CUSTOMER')")
    @PreAuthorize("hasAnyRole('OWNER','CUSTOMER')")
    public Map<String,Object> uploadImage(@RequestParam("file") MultipartFile file){
        System.out.println("UPLOAD HIT");
        String url = cloudinaryService.uploadImage(file);
        return Map.of("url",url);
    }
}
