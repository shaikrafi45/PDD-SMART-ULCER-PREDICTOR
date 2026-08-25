package com.example.automation.listeners;

import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import com.example.automation.tests.AppiumE2ETest;
import com.example.automation.utils.ExcelReporter;
import com.example.automation.utils.HtmlReporter;
import com.example.automation.utils.ScreenshotUtil;
import com.example.automation.utils.TestDataGenerator.TestCase;

import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;

public class TestListener implements ITestListener {

    private final List<TestCase> executedCases = new ArrayList<>();
    private long startTime;

    @Override
    public void onStart(ITestContext context) {
        startTime = System.currentTimeMillis();
        System.out.println("====== Test Suite Started: Web E2E Selenium Automation ======");
    }

    @Override
    public void onTestStart(ITestResult result) {
        // Log individual test startup
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        Object[] params = result.getParameters();
        if (params.length > 0 && params[0] instanceof TestCase) {
            TestCase tc = (TestCase) params[0];
            tc.status = "PASSED";
            tc.executionTimeMs = result.getEndMillis() - result.getStartMillis();
            executedCases.add(tc);
            System.out.println("PASSED: " + tc.id + " - " + tc.testName);
        }
    }

    @Override
    public void onTestFailure(ITestResult result) {
        Object[] params = result.getParameters();
        if (params.length > 0 && params[0] instanceof TestCase) {
            TestCase tc = (TestCase) params[0];
            tc.status = "FAILED";
            tc.executionTimeMs = result.getEndMillis() - result.getStartMillis();
            if (result.getThrowable() != null) {
                tc.failureReason = result.getThrowable().getMessage();
            }
            
            // Capture failure screenshot
            try {
                Object testInstance = result.getInstance();
                if (testInstance instanceof AppiumE2ETest) {
                    AppiumE2ETest e2eTest = (AppiumE2ETest) testInstance;
                    if (e2eTest.getDriver() != null) {
                        new File("reports/Screenshots").mkdirs();
                        String screenshotPath = ScreenshotUtil.captureScreenshot(
                            e2eTest.getDriver(), 
                            tc.id, 
                            "reports/Screenshots"
                        );
                        tc.failureReason += " (Screenshot: " + screenshotPath + ")";
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to capture screenshot: " + e.getMessage());
            }

            executedCases.add(tc);
            System.out.println("FAILED: " + tc.id + " - " + tc.testName + " Reason: " + tc.failureReason);
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        Object[] params = result.getParameters();
        if (params.length > 0 && params[0] instanceof TestCase) {
            TestCase tc = (TestCase) params[0];
            tc.status = "SKIPPED";
            tc.executionTimeMs = 0;
            tc.failureReason = "Test skipped during suite run.";
            executedCases.add(tc);
            System.out.println("SKIPPED: " + tc.id + " - " + tc.testName);
        }
    }

    @Override
    public void onFinish(ITestContext context) {
        System.out.println("====== Test Suite Finished. Generating Reports... ======");
        
        long duration = System.currentTimeMillis() - startTime;
        
        // Generate main Excel and HTML reports
        ExcelReporter.generateReports(executedCases, "reports/Excel");
        HtmlReporter.generateReports(executedCases, "reports/HTML");

        // Write summary markdown for GitHub Actions summary
        writeMarkdownSummary(executedCases, duration);
    }

    private void writeMarkdownSummary(List<TestCase> cases, long durationMs) {
        int total = cases.size();
        int passed = 0, failed = 0, skipped = 0;
        for (TestCase tc : cases) {
            if ("PASSED".equalsIgnoreCase(tc.status)) passed++;
            else if ("FAILED".equalsIgnoreCase(tc.status)) failed++;
            else skipped++;
        }
        double passRate = (double) passed / total * 100.0;
        
        StringBuilder sb = new StringBuilder();
        sb.append("# Web E2E Selenium Execution Summary\n\n")
          .append("- **Execution Date**: ").append(java.time.LocalDate.now()).append("\n")
          .append("- **Browser**: Chrome Headless\n")
          .append("- **Platform**: Windows Local / GHA macOS Runner\n\n")
          .append("### Execution Metrics\n\n")
          .append("| Metric | Value |\n")
          .append("| --- | --- |\n")
          .append("| **Total Test Cases** | ").append(total).append(" |\n")
          .append("| **Passed** | ").append(passed).append(" |\n")
          .append("| **Failed** | ").append(failed).append(" |\n")
          .append("| **Skipped** | ").append(skipped).append(" |\n")
          .append("| **Pass Percentage** | ").append(String.format("%.2f%%", passRate)).append(" |\n")
          .append("| **Execution Duration** | ").append(durationMs / 1000.0).append("s |\n\n");

        sb.append("### FAILED TESTS\n\n");
        boolean hasFailed = false;
        for (TestCase tc : cases) {
            if ("FAILED".equalsIgnoreCase(tc.status)) {
                sb.append("- ✗ **").append(tc.id).append("** - ").append(tc.testName).append("\n")
                  .append("  *Reason*: ").append(tc.failureReason).append("\n");
                hasFailed = true;
            }
        }
        if (!hasFailed) {
            sb.append("No failures detected! (Pass rate is 100%)\n");
        }

        File file = new File("reports/Summary/summary.md");
        if (file.getParentFile() != null && !file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }

        try (FileWriter fw = new FileWriter(file)) {
            fw.write(sb.toString());
            System.out.println("Markdown execution summary generated successfully at: " + file.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Failed to write Markdown summary: " + e.getMessage());
        }
    }
}
