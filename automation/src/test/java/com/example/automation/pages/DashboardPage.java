package com.example.automation.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class DashboardPage extends BasePage {

    // Web-optimized locators for dashboard and menus
    private final By welcomeHeader = By.cssSelector(".welcome-header, h2, h3");
    private final By uploadNavButton = By.xpath("//nav//a[contains(text(),'Scan') or contains(text(),'Upload')]");
    private final By historyNavButton = By.xpath("//nav//a[contains(text(),'History') or contains(text(),'Logs')]");
    private final By profileNavButton = By.xpath("//nav//a[contains(text(),'Profile') or contains(text(),'Account')]");
    private final By precautionsNavButton = By.xpath("//nav//a[contains(text(),'Precaution') or contains(text(),'Care')]");
    private final By logoutButton = By.cssSelector(".logout-btn, button.btn-logout");

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    public boolean isWelcomeHeaderDisplayed() {
        return isElementDisplayed(welcomeHeader);
    }

    public void navigateToUpload() {
        click(uploadNavButton);
    }

    public void navigateToHistory() {
        click(historyNavButton);
    }

    public void navigateToProfile() {
        click(profileNavButton);
    }

    public void navigateToPrecautions() {
        click(precautionsNavButton);
    }

    public void clickLogout() {
        click(logoutButton);
    }
}
