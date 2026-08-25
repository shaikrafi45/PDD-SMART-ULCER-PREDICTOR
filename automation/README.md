# Web Selenium E2E Automation Framework & CI/CD Pipeline

This directory contains the Selenium web automation framework designed to run E2E test suites for the React JS Web application.

---

## 📂 Directory Layout

```
automation/
├── src/
│   └── test/java/com/example/automation/
│       ├── pages/       # Page Object Model classes (BasePage, LoginPage, DashboardPage)
│       ├── tests/       # Test suites and base setup (BaseTest, AppiumE2ETest)
│       ├── listeners/   # TestNG custom execution listeners (TestListener)
│       └── utils/       # Utility helpers (ExcelReporter, HtmlReporter, TestDataGenerator, ScreenshotUtil)
├── data/                # Dynamically generated JSON test case data
├── runners/             # TestNG XML suite runner configs
├── reports/             # Execution reports (HTML dashboard, Excel, summaries, logs)
└── build.gradle         # Build configuration file
```

---

## 🚀 Local Execution Guide

### 1. Pre-requisites
- **Java JDK 11 or 17** installed and configured (`JAVA_HOME`).
- **Google Chrome** browser installed.
- **ChromeDriver** installed (ensure it matches your local Chrome browser version). In modern Selenium 4, Selenium Manager handles ChromeDriver download and execution automatically!

### 2. Running Web E2E Tests
1. Make sure your local web server is running at `http://localhost:5173`.
2. Navigate to the `automation/` folder in your terminal:
   ```bash
   cd automation
   ```
3. Run the Gradle test task:
   ```bash
   ./gradlew test
   ```
   *(Note: If Chrome or the local web server is offline, the framework will automatically fall back to **Web Simulation Mode** to verify compilation and dry-run metrics).*

---

## 🌐 CI/CD Execution Guide (GitHub Actions)

The pipeline is fully automated in `.github/workflows/web-e2e.yml`. It runs automatically on:
* Every **push** to `main` or `master`.
* Every **pull request** targeting those branches.
* Manual trigger via **Workflow Dispatch**.
* A scheduled daily run (at 2:00 AM UTC).

### Output Artifacts
At the end of the pipeline run:
- Excel sheets, HTML dashboards, and logs are zipped and uploaded as build artifacts (kept for **30 days**).
- A custom Markdown execution overview is pushed directly to the **GitHub Action Run Summary**.
- Detailed reports are deployed to your repository's **GitHub Pages** site under `reports/latest/execution-report.html` and archived by build number under `reports/history/build-N/`.

---

## 🛠️ Troubleshooting Guide

### 1. "JAVA_HOME is not set"
Make sure your system JDK environment variable is set. On Windows:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

### 2. Chrome Driver Initialization Failed
Ensure your Google Chrome browser is installed. Selenium 4 automatically resolves and runs the matching ChromeDriver version for you.

---

## ⚙️ Repository Configuration Guide
To enable GitHub Pages reporting:
1. Push this code to your GitHub Repository.
2. Go to your repository **Settings** -> **Pages**.
3. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
4. Choose the **`gh-pages`** branch and the root directory `/`, then click **Save**.
5. Your live report URL will be available at:
   `https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`
