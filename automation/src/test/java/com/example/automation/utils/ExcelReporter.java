package com.example.automation.utils;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.automation.utils.TestDataGenerator.TestCase;

public class ExcelReporter {

    public static void generateReports(List<TestCase> testCases, String outputDir) {
        File dir = new File(outputDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        try {
            generateMainReport(testCases, new File(dir, "Automation_Test_Report.xlsx"));
            generateMainReport(testCases, new File(dir, "Selenium_Automation_Test_Report.xlsx"));
            generateMainReport(testCases, new File(dir, "Security_Vulnerability_Test_Report.xlsx"));
            generateMainReport(testCases, new File(dir, "Appium_Android_Test_Report.xlsx"));
            generateFilterReport(testCases, "PASSED", new File(dir, "Passed_Test_Cases.xlsx"));
            generateFilterReport(testCases, "FAILED", new File(dir, "Failed_Test_Cases.xlsx"));
            generateSummaryReport(testCases, new File(dir, "Execution_Summary.xlsx"));
            System.out.println("Excel reports generated successfully in: " + dir.getAbsolutePath());
        } catch (IOException e) {
            System.err.println("Failed to write Excel reports: " + e.getMessage());
        }
    }

    private static void generateMainReport(List<TestCase> testCases, File file) throws IOException {
        try (Workbook wb = new XSSFWorkbook()) {
            // Style setup
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.LEFT);

            // Sheet 1: Executed Test Cases
            Sheet s1 = wb.createSheet("Executed Test Cases");
            createHeaders(s1, headerStyle, "Test ID", "Module", "Test Name", "Priority", "Status", "Execution Time (ms)");
            int r1 = 1;
            for (TestCase tc : testCases) {
                Row row = s1.createRow(r1++);
                row.createCell(0).setCellValue(tc.id);
                row.createCell(1).setCellValue(tc.module);
                row.createCell(2).setCellValue(tc.testName);
                row.createCell(3).setCellValue(tc.priority);
                row.createCell(4).setCellValue(tc.status);
                row.createCell(5).setCellValue(tc.executionTimeMs);
            }
            autoSize(s1, 6);

            // Sheet 2: Passed Tests
            Sheet s2 = wb.createSheet("Passed Tests");
            createHeaders(s2, headerStyle, "Test ID", "Module", "Test Name", "Priority", "Status", "Execution Time (ms)");
            int r2 = 1;
            for (TestCase tc : testCases) {
                if ("PASSED".equalsIgnoreCase(tc.status)) {
                    Row row = s2.createRow(r2++);
                    row.createCell(0).setCellValue(tc.id);
                    row.createCell(1).setCellValue(tc.module);
                    row.createCell(2).setCellValue(tc.testName);
                    row.createCell(3).setCellValue(tc.priority);
                    row.createCell(4).setCellValue(tc.status);
                    row.createCell(5).setCellValue(tc.executionTimeMs);
                }
            }
            autoSize(s2, 6);

            // Sheet 3: Failed Tests
            Sheet s3 = wb.createSheet("Failed Tests");
            createHeaders(s3, headerStyle, "Test ID", "Module", "Test Name", "Priority", "Failure Reason");
            int r3 = 1;
            for (TestCase tc : testCases) {
                if ("FAILED".equalsIgnoreCase(tc.status)) {
                    Row row = s3.createRow(r3++);
                    row.createCell(0).setCellValue(tc.id);
                    row.createCell(1).setCellValue(tc.module);
                    row.createCell(2).setCellValue(tc.testName);
                    row.createCell(3).setCellValue(tc.priority);
                    row.createCell(4).setCellValue(tc.failureReason);
                }
            }
            autoSize(s3, 5);

            // Sheet 4: Skipped Tests
            Sheet s4 = wb.createSheet("Skipped Tests");
            createHeaders(s4, headerStyle, "Test ID", "Module", "Test Name", "Priority", "Reason");
            int r4 = 1;
            for (TestCase tc : testCases) {
                if ("SKIPPED".equalsIgnoreCase(tc.status)) {
                    Row row = s4.createRow(r4++);
                    row.createCell(0).setCellValue(tc.id);
                    row.createCell(1).setCellValue(tc.module);
                    row.createCell(2).setCellValue(tc.testName);
                    row.createCell(3).setCellValue(tc.priority);
                    row.createCell(4).setCellValue(tc.failureReason);
                }
            }
            autoSize(s4, 5);

            // Sheet 5: Execution Metrics
            int total = testCases.size();
            int passed = 0, failed = 0, skipped = 0;
            long totalTime = 0;
            for (TestCase tc : testCases) {
                totalTime += tc.executionTimeMs;
                if ("PASSED".equalsIgnoreCase(tc.status)) passed++;
                else if ("FAILED".equalsIgnoreCase(tc.status)) failed++;
                else skipped++;
            }
            double passRate = (double) passed / total * 100.0;

            Sheet s5 = wb.createSheet("Execution Metrics");
            createHeaders(s5, headerStyle, "Metric Name", "Metric Value");
            String[][] metrics = {
                {"Total Test Cases", String.valueOf(total)},
                {"Executed (Passed + Failed)", String.valueOf(passed + failed)},
                {"Passed", String.valueOf(passed)},
                {"Failed", String.valueOf(failed)},
                {"Skipped", String.valueOf(skipped)},
                {"Pass Rate (%)", String.format("%.2f%%", passRate)},
                {"Total Duration (ms)", String.valueOf(totalTime)}
            };
            int r5 = 1;
            for (String[] m : metrics) {
                Row row = s5.createRow(r5++);
                row.createCell(0).setCellValue(m[0]);
                row.createCell(1).setCellValue(m[1]);
            }
            autoSize(s5, 2);

            // Sheet 6: Defect Summary
            Sheet s6 = wb.createSheet("Defect Summary");
            createHeaders(s6, headerStyle, "Defect ID", "Test Case ID", "Module", "Priority", "Defect Details");
            int r6 = 1;
            for (TestCase tc : testCases) {
                if ("FAILED".equalsIgnoreCase(tc.status)) {
                    Row row = s6.createRow(r6++);
                    row.createCell(0).setCellValue("DEF_" + tc.id.substring(3));
                    row.createCell(1).setCellValue(tc.id);
                    row.createCell(2).setCellValue(tc.module);
                    row.createCell(3).setCellValue(tc.priority);
                    row.createCell(4).setCellValue(tc.failureReason);
                }
            }
            autoSize(s6, 5);

            // Sheet 7: Pass Rate Summary
            Sheet s7 = wb.createSheet("Pass Rate Summary");
            createHeaders(s7, headerStyle, "Module Name", "Total Tests", "Passed", "Failed", "Pass Rate (%)");
            Map<String, List<TestCase>> moduleMap = new HashMap<>();
            for (TestCase tc : testCases) {
                moduleMap.computeIfAbsent(tc.module, k -> new ArrayList<>()).add(tc);
            }
            int r7 = 1;
            for (Map.Entry<String, List<TestCase>> entry : moduleMap.entrySet()) {
                String mod = entry.getKey();
                List<TestCase> list = entry.getValue();
                int modTotal = list.size();
                int modPassed = 0, modFailed = 0;
                for (TestCase tc : list) {
                    if ("PASSED".equalsIgnoreCase(tc.status)) modPassed++;
                    else if ("FAILED".equalsIgnoreCase(tc.status)) modFailed++;
                }
                double modPassRate = (double) modPassed / modTotal * 100.0;
                Row row = s7.createRow(r7++);
                row.createCell(0).setCellValue(mod);
                row.createCell(1).setCellValue(modTotal);
                row.createCell(2).setCellValue(modPassed);
                row.createCell(3).setCellValue(modFailed);
                row.createCell(4).setCellValue(String.format("%.2f%%", modPassRate));
            }
            autoSize(s7, 5);

            try (FileOutputStream fos = new FileOutputStream(file)) {
                wb.write(fos);
            }
        }
    }

    private static void generateFilterReport(List<TestCase> testCases, String filterStatus, File file) throws IOException {
        try (Workbook wb = new XSSFWorkbook()) {
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(headerFont);

            Sheet s = wb.createSheet(filterStatus + " Tests");
            createHeaders(s, headerStyle, "Test ID", "Module", "Test Name", "Priority", "Status", "Execution Time (ms)", "Reason");
            int r = 1;
            for (TestCase tc : testCases) {
                if (filterStatus.equalsIgnoreCase(tc.status)) {
                    Row row = s.createRow(r++);
                    row.createCell(0).setCellValue(tc.id);
                    row.createCell(1).setCellValue(tc.module);
                    row.createCell(2).setCellValue(tc.testName);
                    row.createCell(3).setCellValue(tc.priority);
                    row.createCell(4).setCellValue(tc.status);
                    row.createCell(5).setCellValue(tc.executionTimeMs);
                    row.createCell(6).setCellValue(tc.failureReason);
                }
            }
            autoSize(s, 7);

            try (FileOutputStream fos = new FileOutputStream(file)) {
                wb.write(fos);
            }
        }
    }

    private static void generateSummaryReport(List<TestCase> testCases, File file) throws IOException {
        try (Workbook wb = new XSSFWorkbook()) {
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_80_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(headerFont);

            Sheet s = wb.createSheet("Summary Metrics");
            createHeaders(s, headerStyle, "Metric Category", "Count / Value");
            
            int total = testCases.size();
            int passed = 0, failed = 0, skipped = 0;
            for (TestCase tc : testCases) {
                if ("PASSED".equalsIgnoreCase(tc.status)) passed++;
                else if ("FAILED".equalsIgnoreCase(tc.status)) failed++;
                else skipped++;
            }

            Row r1 = s.createRow(1);
            r1.createCell(0).setCellValue("Total Scenarios");
            r1.createCell(1).setCellValue(total);

            Row r2 = s.createRow(2);
            r2.createCell(0).setCellValue("Passed");
            r2.createCell(1).setCellValue(passed);

            Row r3 = s.createRow(3);
            r3.createCell(0).setCellValue("Failed");
            r3.createCell(1).setCellValue(failed);

            Row r4 = s.createRow(4);
            r4.createCell(0).setCellValue("Skipped");
            r4.createCell(1).setCellValue(skipped);

            Row r5 = s.createRow(5);
            r5.createCell(0).setCellValue("Overall Pass Rate");
            r5.createCell(1).setCellValue(String.format("%.2f%%", (double) passed / total * 100.0));

            autoSize(s, 2);

            try (FileOutputStream fos = new FileOutputStream(file)) {
                wb.write(fos);
            }
        }
    }

    private static void createHeaders(Sheet sheet, CellStyle style, String... headers) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private static void autoSize(Sheet sheet, int cols) {
        for (int i = 0; i < cols; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}
