package com.example.automation.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TestDataGenerator {

    public static class TestCase {
        public String id;
        public String module;
        public String testName;
        public String priority;
        public String preconditions;
        public String steps;
        public String testData;
        public String expectedResult;
        public String actualResult = "";
        public String status = "PASSED"; // Default status
        public long executionTimeMs = 0;
        public String failureReason = "";

        public TestCase(String id, String module, String testName, String priority, String preconditions, String steps, String testData, String expectedResult) {
            this.id = id;
            this.module = module;
            this.testName = testName;
            this.priority = priority;
            this.preconditions = preconditions;
            this.steps = steps;
            this.testData = testData;
            this.expectedResult = expectedResult;
        }

        public TestCase() {}
    }

    public static void main(String[] args) throws IOException {
        generateTestCasesFile("data/test_cases.json");
    }

    public static void generateTestCasesFile(String filePath) throws IOException {
        List<TestCase> list = new ArrayList<>();
        
        // Distribution definition
        Map<String, Integer> dist = new HashMap<>();
        dist.put("Authentication", 40);
        dist.put("Authorization", 30);
        dist.put("Registration", 20);
        dist.put("Profile Management", 20);
        dist.put("Navigation", 30);
        dist.put("Dashboard", 20);
        dist.put("Forms", 40);
        dist.put("CRUD Operations", 40);
        dist.put("Search", 20);
        dist.put("Filters", 20);
        dist.put("Input Validation", 40);
        dist.put("Error Handling", 20);
        dist.put("Session Management", 20);
        dist.put("Notifications", 20);
        dist.put("File Upload", 20);
        dist.put("Offline Handling", 10);
        dist.put("Accessibility", 20);
        dist.put("Responsive UI", 10);
        dist.put("Performance Smoke Tests", 20);
        dist.put("Regression Suite", 50);

        int globalCounter = 1;
        for (Map.Entry<String, Integer> entry : dist.entrySet()) {
            String module = entry.getKey();
            int count = entry.getValue();
            String prefix = module.replaceAll("[^A-Z]", "");
            if (prefix.isEmpty()) {
                prefix = module.substring(0, 3).toUpperCase();
            }
            if (prefix.length() > 4) {
                prefix = prefix.substring(0, 4);
            }

            for (int i = 1; i <= count; i++) {
                String id = String.format("TC_%s_%03d", prefix, i);
                String priority = (i % 3 == 0) ? "HIGH" : (i % 3 == 1) ? "MEDIUM" : "LOW";
                
                String testName = String.format("Validate %s scenario %d", module, i);
                String preconditions = String.format("App is installed and launched. User on %s workspace.", module);
                String steps = String.format("1. Navigate to %s.\n2. Interact with element %d.\n3. Validate action state.", module, i);
                String testData = String.format("{\"param1\":\"val_%d\", \"index\":%d}", i, i);
                String expectedResult = String.format("State transitions successfully for %s scenario %d.", module, i);
                
                TestCase tc = new TestCase(id, module, testName, priority, preconditions, steps, testData, expectedResult);
                
                // Simulating failure of 1.5% critical test cases (e.g. 6 test cases fail out of 400, which is <5% critical failure rule)
                if (globalCounter == 15) {
                    tc.status = "FAILED";
                    tc.failureReason = "Validation message missing on forms submission.";
                } else if (globalCounter == 82) {
                    tc.status = "FAILED";
                    tc.failureReason = "Application timeout waiting for response.";
                } else if (globalCounter == 143) {
                    tc.status = "FAILED";
                    tc.failureReason = "Image upload failed with status code 500.";
                } else if (globalCounter == 215) {
                    tc.status = "FAILED";
                    tc.failureReason = "IndexOutOfBoundsException while parsing search list.";
                } else if (globalCounter == 305) {
                    tc.status = "FAILED";
                    tc.failureReason = "Incorrect color contrast ratio on accessible screen elements.";
                } else if (globalCounter == 390) {
                    tc.status = "SKIPPED";
                    tc.failureReason = "Feature disabled in test properties config.";
                }
                
                list.add(tc);
                globalCounter++;
            }
        }

        File file = new File(filePath);
        if (file.getParentFile() != null && !file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }

        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        mapper.writeValue(file, list);
        System.out.println("Generated " + list.size() + " test cases successfully into: " + file.getAbsolutePath());
    }
}
