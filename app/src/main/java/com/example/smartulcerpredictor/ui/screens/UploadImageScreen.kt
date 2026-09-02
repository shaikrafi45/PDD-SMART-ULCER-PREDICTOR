package com.example.smartulcerpredictor.ui.screens

import android.graphics.BitmapFactory
import android.graphics.Bitmap
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.launch
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smartulcerpredictor.data.api.RetrofitClient
import com.example.smartulcerpredictor.data.api.UserSession
import kotlinx.coroutines.launch
import okhttp3.MediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.ByteArrayOutputStream

import com.example.smartulcerpredictor.ml.UlcerClassifier
import com.example.smartulcerpredictor.ui.AnalysisResult
import com.example.smartulcerpredictor.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadImageScreen(
    onBack: () -> Unit = {},
    onTakePhoto: () -> Unit = {},
    onUploadImage: () -> Unit = {},
    viewModel: MainViewModel? = null
) {
    var isLoading by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    // Initialize Classifier
    val classifier = remember { UlcerClassifier(context) }
    
    // Cleanup classifier when composable is disposed
    DisposableEffect(Unit) {
        onDispose {
            classifier.close()
        }
    }

    // Helper function to handle analysis
    fun processImage(bitmap: Bitmap) {
        isLoading = true
        coroutineScope.launch {
            try {
                // Run Comprehensive Tissue Analysis
                val analysis = classifier.analyzeWound(bitmap)
                
                // Validate if it is a genuine ulcer image
                if (!analysis.isValidUlcer) {
                    isLoading = false
                    viewModel?.setAnalysisResult(
                        AnalysisResult(
                            label = "Unable to Identify",
                            confidence = 0f,
                            image = bitmap,
                            tissueBreakdown = emptyMap()
                        )
                    )
                    val errorMsg = analysis.errorMessage ?: "Unable to identify: No active ulcer wound detected."
                    Toast.makeText(context, errorMsg, Toast.LENGTH_LONG).show()
                    onUploadImage()
                    return@launch
                }

                // Set local analysis result immediately
                viewModel?.setAnalysisResult(
                    AnalysisResult(
                        label = analysis.primaryLabel,
                        confidence = analysis.confidence,
                        image = bitmap,
                        tissueBreakdown = analysis.tissueBreakdown
                    )
                )

                // Background sync to backend database for history logging (fire & forget, non-blocking)
                kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                    try {
                        val part = getMultipartFromBitmap(bitmap)
                        if (part != null) {
                            val userIdBody = UserSession.userId.toString()
                                .toRequestBody("text/plain".toMediaTypeOrNull())
                            val resultBody = analysis.primaryLabel
                                .toRequestBody("text/plain".toMediaTypeOrNull())
                            val confidenceBody = analysis.confidence.toString()
                                .toRequestBody("text/plain".toMediaTypeOrNull())
                            RetrofitClient.instance.uploadImage(userIdBody, resultBody, confidenceBody, part)
                        }
                    } catch (netErr: Exception) {
                        // Silent log for offline network resilience
                        netErr.printStackTrace()
                    }
                }
                
                isLoading = false
                onUploadImage() // Navigates directly to analysis_result
            } catch (e: Exception) {
                isLoading = false
                Toast.makeText(context, "Analysis Error: ${e.message}", Toast.LENGTH_SHORT).show()
                onUploadImage()
            }
        }
    }

    // Gallery Picker launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                val inputStream = context.contentResolver.openInputStream(uri)
                val bitmap = BitmapFactory.decodeStream(inputStream)
                inputStream?.close()
                if (bitmap != null) {
                    processImage(bitmap)
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Failed to load image", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Camera Capture launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            processImage(bitmap)
        }
    }

    Scaffold(
        containerColor = Color(0xFFFBFBFB),
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    TextButton(onClick = onBack, enabled = !isLoading) {
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
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFFBFBFB))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Upload Wound Image",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1976D2),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(40.dp))

            // Alignment Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .border(1.dp, Color.LightGray, RoundedCornerShape(32.dp))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = Color(0xFF1976D2))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(text = "Uploading & Analyzing...", color = Color.Gray, fontSize = 16.sp)
                    }
                } else {
                    Text(
                        text = "Align wound inside this box",
                        color = Color.Gray,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            Text(
                text = "Reminder: Keep good lighting, place your wound inside the box and take photo.",
                fontSize = 15.sp,
                color = Color.Black,
                textAlign = TextAlign.Center,
                lineHeight = 22.sp
            )

            Spacer(modifier = Modifier.weight(1f))

            // Take Photo Button
            Button(
                onClick = {
                    if (!isLoading) {
                        cameraLauncher.launch()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                enabled = !isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50))
            ) {
                Icon(Icons.Default.CameraAlt, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Take Photo", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Upload Image Button
            Button(
                onClick = {
                    if (!isLoading) {
                        galleryLauncher.launch("image/*")
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                enabled = !isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1976D2))
            ) {
                Icon(Icons.Default.Folder, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Upload Image", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

fun getMultipartFromBitmap(bitmap: Bitmap): MultipartBody.Part? {
    return try {
        val bos = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, bos)
        val bytes = bos.toByteArray()
        bos.close()
        val requestFile = bytes.toRequestBody("image/jpeg".toMediaTypeOrNull())
        MultipartBody.Part.createFormData("image", "wound_capture.jpg", requestFile)
    } catch (e: Exception) {
        null
    }
}

@Preview(showBackground = true)
@Composable
fun UploadImageScreenPreview() {
    UploadImageScreen()
}
