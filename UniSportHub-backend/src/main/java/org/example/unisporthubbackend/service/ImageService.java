package org.example.unisporthubbackend.service;

import io.jsonwebtoken.io.IOException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {

    public String saveImage(MultipartFile file) throws IOException, java.io.IOException {

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path path = Paths.get("uploads/tournaments/" + fileName);

        Files.createDirectories(path.getParent());

        Files.write(path, file.getBytes());

        return "/uploads/tournaments/" + fileName;
    }
}
