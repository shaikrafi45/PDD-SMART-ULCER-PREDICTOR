package com.example.smartulcerpredictor.ui.screens

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smartulcerpredictor.data.api.UserSession
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

import com.example.smartulcerpredictor.ui.AnalysisResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalysisResultScreen(
    result: AnalysisResult? = null,
    onBack: () -> Unit = {},
    onLogout: () -> Unit = {},
    onPrecautionsClick: () -> Unit = {},
    onViewHistory: () -> Unit = {}
) {
    var showProfileDialog by remember { mutableStateOf(false) }
    val resultText = result?.label ?: "Unable to Identify"
    val confidenceText = "Confidence: ${"%.2f".format(result?.confidence ?: 0f)}%"
    val localBitmap = result?.image

    UserProfileDialog(
        isOpen = showProfileDialog,
        onClose = { showProfileDialog = false },
        onLogout = onLogout
    )

    Scaffold(
        containerColor = Color(0xFFFBFBFB),
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    TextButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color(0xFF1976D2)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Back",
                            color = Color(0xFF1976D2),
                            fontSize = 18.sp
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { showProfileDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.AccountCircle,
                            contentDescription = "Profile",
                            tint = Color(0xFF1976D2),
                            modifier = Modifier.size(32.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFFBFBFB))
            )
        },
        bottomBar = {
            Button(
                onClick = onViewHistory,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1976D2))
            ) {
                Icon(Icons.Default.History, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "View History", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Wound Analysis Result",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1976D2)
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Uploaded Image View (Local or Network)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color.LightGray)
            ) {
                if (localBitmap != null) {
                    Image(
                        bitmap = localBitmap.asImageBitmap(),
                        contentDescription = "Analyzed Wound",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Text(
                        text = "Image preview not available",
                        modifier = Modifier.align(Alignment.Center),
                        color = Color.White
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            // Result Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = when (resultText.lowercase()) {
                        "granulation" -> Color(0xFFD32F2F)
                        "slough" -> Color(0xFFF57F17)
                        "necrotic" -> Color(0xFF212121)
                        "epithelialisation", "epithelialization" -> Color(0xFFE91E63)
                        "normal" -> Color(0xFF2E7D32)
                        "unable to identify" -> Color(0xFF616161)
                        else -> Color(0xFF616161)
                    }
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = resultText,
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = confidenceText,
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Warning / Informational Message
            val isUnable = resultText.equals("Unable to Identify", ignoreCase = true)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = if (isUnable) "ℹ️" else "⚠️", fontSize = 20.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isUnable) {
                        "No active ulcer wound could be identified in this image. Please upload a clear, focused close-up photo of a foot or leg ulcer wound."
                    } else {
                        "This assessment is AI-generated. Check 'Precautions & Tips' below for wound care guidelines and consult a medical professional."
                    },
                    fontSize = 13.sp,
                    color = Color.Black,
                    lineHeight = 18.sp
                )
            }

            Spacer(modifier = Modifier.height(30.dp))

            // Precautions & Tips Button
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.clickable { onPrecautionsClick() }
            ) {
                Surface(
                    modifier = Modifier.size(64.dp),
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF4CAF50)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.MedicalServices,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Precautions & Tips",
                    color = Color(0xFF4CAF50),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

/**
 * Lightweight, zero-dependency composable to load and display images from a URL
 */
@Composable
fun NetworkImage(url: String) {
    var bitmap by remember { mutableStateOf<Bitmap?>(null) }
    var hasError by remember { mutableStateOf(false) }

    val resolvedUrl = remember(url) {
        com.example.smartulcerpredictor.data.api.RetrofitClient.resolveImageUrl(url)
    }

    LaunchedEffect(resolvedUrl) {
        if (resolvedUrl.isEmpty()) {
            hasError = true
            return@LaunchedEffect
        }
        withContext(Dispatchers.IO) {
            try {
                val connection = (URL(resolvedUrl).openConnection() as HttpURLConnection).apply {
                    doInput = true
                    connectTimeout = 10000
                    readTimeout = 10000
                    instanceFollowRedirects = true
                }
                connection.connect()
                if (connection.responseCode in 200..299) {
                    val inputStream = connection.inputStream
                    val decoded = BitmapFactory.decodeStream(inputStream)
                    inputStream.close()
                    withContext(Dispatchers.Main) {
                        if (decoded != null) {
                            bitmap = decoded
                            hasError = false
                        } else {
                            hasError = true
                        }
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        hasError = true
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    hasError = true
                }
            }
        }
    }

    if (bitmap != null) {
        Image(
            bitmap = bitmap!!.asImageBitmap(),
            contentDescription = "Analyzed Wound",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
    } else if (hasError) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(text = "Image preview not available", color = Color.Gray, fontSize = 13.sp)
        }
    } else {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF1976D2), modifier = Modifier.size(28.dp))
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AnalysisResultScreenPreview() {
    AnalysisResultScreen()
}
