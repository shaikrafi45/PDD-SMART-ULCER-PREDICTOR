package com.example.smartulcerpredictor

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.smartulcerpredictor.data.api.UserSession
import com.example.smartulcerpredictor.ui.MainViewModel
import com.example.smartulcerpredictor.ui.screens.*
import com.example.smartulcerpredictor.ui.theme.SmartUlcerPredictorTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Load persisted session so we know if the user is already logged in
        UserSession.init(this)

        setContent {
            SmartUlcerPredictorTheme {
                val navController = rememberNavController()
                val viewModel: MainViewModel = viewModel()

                // If user is already logged in, skip auth screens and go straight to about
                val startDestination = if (UserSession.isLoggedIn()) "about" else "initial"

                NavHost(navController = navController, startDestination = startDestination) {
                    composable("initial") {
                        InitialScreen(onTimeout = {
                            navController.navigate("disclaimer") {
                                popUpTo("initial") { inclusive = true }
                            }
                        })
                    }
                    composable("disclaimer") {
                        DisclaimerScreen(onConfirm = {
                            navController.navigate("register")
                        })
                    }
                    composable("register") {
                        RegisterScreen(
                            onRegister = {
                                navController.navigate("about") {
                                    popUpTo("register") { inclusive = true }
                                }
                            },
                            onLoginClick = {
                                navController.navigate("login")
                            }
                        )
                    }
                    composable("login") {
                        LoginScreen(
                            onBack = {
                                navController.popBackStack()
                            },
                            onLogin = {
                                navController.navigate("about") {
                                    popUpTo("login") { inclusive = true }
                                }
                            },
                            onForgotPassword = {
                                navController.navigate("forgot_password")
                            }
                        )
                    }
                    composable("forgot_password") {
                        ForgotPasswordScreen(
                            onBack = {
                                navController.popBackStack()
                            },
                            onSendCode = { email ->
                                navController.navigate("reset_password")
                            }
                        )
                    }
                    composable("reset_password") {
                        ResetPasswordScreen(
                            onBack = {
                                navController.popBackStack()
                            },
                            onResetSuccess = {
                                navController.navigate("login") {
                                    popUpTo("login") { inclusive = true }
                                }
                            }
                        )
                    }
                    composable("about") {
                        AboutScreen(
                            onHistory = { navController.navigate("history") },
                            onLogout = {
                                // Clear persisted session so user must log in again
                                UserSession.clear()
                                navController.navigate("initial") {
                                    popUpTo(0)
                                }
                            },
                            onUploadClick = {
                                navController.navigate("upload_image")
                            }
                        )
                    }
                    composable("upload_image") {
                        UploadImageScreen(
                            onBack = { navController.popBackStack() },
                            onTakePhoto = { 
                                // In a real app, you'd open the camera here
                                navController.navigate("analysis_result") 
                            },
                            onUploadImage = {
                                // In a real app, you'd pick an image here
                                navController.navigate("analysis_result")
                            },
                            viewModel = viewModel
                        )
                    }
                    composable("analysis_result") {
                        val result by viewModel.analysisResult.collectAsState()
                        AnalysisResultScreen(
                            result = result,
                            onBack = { navController.popBackStack() },
                            onLogout = {
                                UserSession.clear()
                                navController.navigate("initial") {
                                    popUpTo(0)
                                }
                            },
                            onPrecautionsClick = { navController.navigate("precautions") },
                            onViewHistory = { navController.navigate("history") }
                        )
                    }
                    composable("precautions") {
                        PrecautionsScreen(
                            onBack = { navController.popBackStack() }
                        )
                    }
                    composable("history") {
                        HistoryScreen(
                            onBack = { navController.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}
