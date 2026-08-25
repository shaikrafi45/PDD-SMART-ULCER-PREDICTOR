package com.example.automation.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {

    // Selectors optimized for the React Web application
    private final By emailInput = By.cssSelector("input[type='email'], #email");
    private final By passwordInput = By.cssSelector("input[type='password'], #password");
    private final By loginButton = By.cssSelector("button[type='submit'], .btn-login");
    private final By registerLink = By.xpath("//a[contains(text(),'Register') or contains(text(),'Sign Up')]");
    private final By forgotPasswordLink = By.xpath("//a[contains(text(),'Forgot') or contains(text(),'Reset')]");
    private final By errorAlert = By.cssSelector(".error-message, .alert-danger");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void enterEmail(String email) {
        type(emailInput, email);
    }

    public void enterPassword(String password) {
        type(passwordInput, password);
    }

    public void clickLogin() {
        click(loginButton);
    }

    public void clickRegisterLink() {
        click(registerLink);
    }

    public void clickForgotPassword() {
        click(forgotPasswordLink);
    }

    public boolean isErrorDisplayed() {
        return isElementDisplayed(errorAlert);
    }

    public String getErrorMessage() {
        return getText(errorAlert);
    }
}
