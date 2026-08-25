# 🏥 Smart Ulcer Predictor (PDD)

[![Live Web App](https://img.shields.io/badge/🌐_Live_Deployment-GitHub_Pages-0052CC?style=for-the-badge)](https://shaikrafi45.github.io/PDD-SMART-ULCER-PREDICTOR/)
[![Phase 7 E2E Tests](https://img.shields.io/badge/🧪_Phase_7_E2E_Tests-470_Passed-2EA44F?style=for-the-badge)](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/actions)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

An Enterprise AI-driven Medical Platform for early detection, classification, and proactive monitoring of pressure ulcer injuries across Web and Mobile ecosystems.

---

## 🌐 Live Application URL
Access the live deployed application on GitHub Pages:
### 👉 **[https://shaikrafi45.github.io/PDD-SMART-ULCER-PREDICTOR/](https://shaikrafi45.github.io/PDD-SMART-ULCER-PREDICTOR/)**

---

## 📊 Downloadable Automation Test Reports (Excel)

Download the complete test execution evidence generated from the CI/CD automation pipeline:

| Test Suite | Test Cases | Pass Rate | Direct Download Link |
| :--- | :--- | :--- | :--- |
| **📊 Master Automation Report** | 470 Scenarios | **100.00%** | [📥 Download `Automation_Test_Report.xlsx`](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/raw/main/automation/reports/Excel/Automation_Test_Report.xlsx) |
| **📈 Execution Summary Report** | 470 Scenarios | **100.00%** | [📥 Download `Summary_Report.xlsx`](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/raw/main/automation/reports/Excel/Summary_Report.xlsx) |
| **✅ Passed Test Cases** | 470 Scenarios | **100.00%** | [📥 Download `Passed_Test_Cases.xlsx`](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/raw/main/automation/reports/Excel/Passed_Test_Cases.xlsx) |
| **🌐 Selenium Web E2E Report** | 300 Scenarios | **100.00%** | [📥 Download `Selenium_Automation_Test_Report.xlsx`](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/raw/main/automation/reports/Excel/Selenium_Automation_Test_Report.xlsx) |
| **🛡️ Security & Vulnerability Report** | 300 Scenarios | **100.00%** | [📥 Download `Security_Vulnerability_Test_Report.xlsx`](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/raw/main/automation/reports/Excel/Security_Vulnerability_Test_Report.xlsx) |
| **📱 Appium Mobile Android Report** | 300 Scenarios | **100.00%** | [📥 Download `Appium_Android_Test_Report.xlsx`](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/raw/main/automation/reports/Excel/Appium_Android_Test_Report.xlsx) |

---

## ⚡ Active CI/CD Workflows on GitHub Actions

- 🚀 **[Phase 7 - Live CI/CD Deployment & Selenium E2E Automation](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/actions/workflows/deploy-and-test.yml)**
- 🌐 **[Selenium Web E2E Test Suite (300 Tests)](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/actions/workflows/selenium-web-e2e.yml)**
- 🛡️ **[Vulnerability & Security Test Suite (300 Tests)](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/actions/workflows/security-vulnerability-tests.yml)**
- 📱 **[Appium Android Mobile Test Suite (300 Tests)](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/actions/workflows/appium-android-e2e.yml)**
- 📦 **[Deploy Web App to GitHub Pages](https://github.com/shaikrafi45/PDD-SMART-ULCER-PREDICTOR/actions/workflows/pages.yml)**

---

## 🏗️ Project Architecture

```
PDD-SMART-ULCER-PREDICTOR/
│
├── app/                  # Android Native Application (Kotlin, Jetpack Compose, TFLite)
├── web/                  # Web Single Page Application (React 18, Vite, TensorFlow.js)
├── backend/              # REST API Backend (PHP 8, MySQL, PHPMailer)
├── automation/           # Test Automation Framework (Selenium, Appium, TestNG, Apache POI)
│   ├── data/             # Test Data JSON Datasets (Selenium, Security, Appium)
│   ├── reports/          # Generated Excel, HTML, JSON, and Markdown summaries
│   │   ├── Excel/        # .xlsx Test Execution Reports
│   │   ├── HTML/         # Interactive Dashboards
│   │   └── Summary/      # Execution Markdown Summaries
│   └── src/test/java/    # TestNG Test Suites & Listeners
│
└── .github/workflows/    # Enterprise CI/CD Pipeline Workflows
```

---

## 🛠️ Tech Stack

- **Mobile Client**: Kotlin, Jetpack Compose, CameraX, TensorFlow Lite, Retrofit2, Coroutines
- **Web Client**: React.js, Vite, Vanilla CSS, TensorFlow.js, Canvas API
- **Backend API**: PHP 8.x, PDO MySQL, PHPMailer, Bcrypt password hashing
- **Automation & QA**: Selenium WebDriver, Appium Mobile Driver, TestNG, Apache POI, Jackson
- **DevOps & CI/CD**: GitHub Actions, GitHub Pages, Gradle, Node.js
