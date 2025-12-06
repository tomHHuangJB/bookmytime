package com.bookmytime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
@RestController
public class Application {
    
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
    
    @GetMapping("/")
    public String hello() {
        return "BookMyTime API is running!";
    }
    
    @GetMapping("/api/health")
    public String health() {
        return "OK";
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/api/database/health")
    public ResponseEntity<String> databaseHealth() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result != null && result == 1) {
                return ResponseEntity.ok("UP");
            } else {
                return ResponseEntity.status(500).body("UNEXPECTED_RESULT");
            }
        } catch (Exception ex) {
            return ResponseEntity.status(503).body("DOWN: " + ex.getMessage());
        }
    }
}
