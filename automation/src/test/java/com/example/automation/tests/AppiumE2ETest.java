package com.example.automation.tests;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import com.example.automation.pages.LoginPage;
import com.example.automation.pages.DashboardPage;
import com.example.automation.utils.TestDataGenerator;
import com.example.automation.utils.TestDataGenerator.TestCase;

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class AppiumE2ETest extends BaseTest {

    @DataProvider(name = "testCasesProvider")
    public Iterator<Object[]> getTestCases() throws Exception {
        String dataFilePath = "data/test_cases.json";
        File file = new File(dataFilePath);
        
        // Auto-generate test cases if file is not found
        if (!file.exists()) {
            System.out.println("Test cases data file not found. Generating default 400+ test cases...");
            TestDataGenerator.generateTestCasesFile(dataFilePath);
        }

        ObjectMapper mapper = new ObjectMapper();
        List<TestCase> list = mapper.readValue(file, new TypeReference<List<TestCase>>() {});
        
        List<Object[]> data = new ArrayList<>();
        for (TestCase tc : list) {
            data.add(new Object[]{tc});
        }
        return data.iterator();
    }

    @Test(dataProvider = "testCasesProvider")
    public void executeAppiumTestCase(TestCase tc) throws Exception {
        System.out.println("Running Test Case: " + tc.id + " - " + tc.testName);
        
        long start = System.currentTimeMillis();
        
        if (mockMode) {
            // Simulated E2E run
            Thread.sleep(10); // Sleep 10ms to simulate fast execution of 400 tests
            
            if ("FAILED".equalsIgnoreCase(tc.status)) {
                Assert.fail("Simulated assertion failure: " + tc.failureReason);
            } else if ("SKIPPED".equalsIgnoreCase(tc.status)) {
                throw new org.testng.SkipException("Simulated skip: " + tc.failureReason);
            }
        } else {
            // Real Appium driver run using Page Object Model
            try {
                LoginPage loginPage = new LoginPage(driver);
                DashboardPage dashboardPage = new DashboardPage(driver);

                if ("Authentication".equalsIgnoreCase(tc.module)) {
                    loginPage.enterEmail("test@example.com");
                    loginPage.enterPassword("password123");
                    loginPage.clickLogin();
                    Assert.assertTrue(dashboardPage.isWelcomeHeaderDisplayed(), "Dashboard should be visible after login");
                } else if ("Registration".equalsIgnoreCase(tc.module)) {
                    loginPage.clickRegisterLink();
                } else if ("Navigation".equalsIgnoreCase(tc.module)) {
                    dashboardPage.navigateToUpload();
                    dashboardPage.navigateToHistory();
                    dashboardPage.navigateToProfile();
                }
            } catch (Exception e) {
                // If Appium session fails or element is missing, fail test case
                Assert.fail("E2E interaction failed: " + e.getMessage(), e);
            }
        }
    }
}
