package com.example.smartulcerpredictor.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AboutScreen(
    onHistory: () -> Unit = {},
    onLogout: () -> Unit = {},
    onUploadClick: () -> Unit = {}
) {
    var showProfileDialog by remember { mutableStateOf(false) }

    UserProfileDialog(
        isOpen = showProfileDialog,
        onClose = { showProfileDialog = false },
        onLogout = onLogout
    )

    Scaffold(
        containerColor = Color(0xFFFBFBFB),
        topBar = {
            TopAppBar(
                title = {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text(
                            text = "ABOUT",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF1976D2)
                            )
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onHistory) {
                        Icon(Icons.Default.History, contentDescription = "History", tint = Color(0xFF1976D2))
                    }
                    IconButton(onClick = { showProfileDialog = true }) {
                        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Profile & Logout", tint = Color(0xFFE53935))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFFBFBFB))
            )
        },
        bottomBar = {
            Button(
                onClick = onUploadClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50))
            ) {
                Text(text = "Click here to upload", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            Text(text = "How It Works", fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Text(
                text = "Upload  →  AI Processing  →  Result",
                color = Color.Gray,
                fontSize = 14.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(text = "Privacy Note", fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Text(
                text = "Your image stays secure. No data is shared.",
                color = Color.Gray,
                fontSize = 14.sp
            )

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = "Understanding wound tissue types and their treatment plans is essential for proper healing. Here's a quick guide:",
                fontSize = 16.sp,
                textAlign = TextAlign.Center,
                lineHeight = 22.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            TissueTypeItem(
                number = "1",
                icon = "🔴",
                title = "Granulation tissue (red, healing)",
                treatment = "Treatment: Keep moist, protect."
            )

            TissueTypeItem(
                number = "2",
                icon = "🟡",
                title = "Slough (yellow, needs cleaning)",
                treatment = "Treatment: Requires debridement and infection control."
            )

            TissueTypeItem(
                number = "3",
                icon = "⚫",
                title = "Necrotic tissue (black, dead)",
                treatment = "Treatment: Surgical or enzymatic debridement required."
            )

            TissueTypeItem(
                number = "4",
                icon = "🌸",
                title = "Epithelialisation (pink, new skin)",
                treatment = "Treatment: Protect, avoid trauma.\n• Key healing indicator."
            )

            Spacer(modifier = Modifier.height(20.dp))

            val context = androidx.compose.ui.platform.LocalContext.current
            OutlinedButton(
                onClick = {
                    val intent = android.content.Intent(
                        android.content.Intent.ACTION_VIEW,
                        android.net.Uri.parse("https://shaikrafi45.github.io/PDD-SMART-ULCER-PREDICTOR/")
                    )
                    context.startActivity(intent)
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF1976D2))
            ) {
                Text(text = "🌐 Open Live Web App Portal", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun TissueTypeItem(number: String, icon: String, title: String, treatment: String) {
    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "$icon $number = ", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Text(text = title, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        Text(
            text = "• $treatment",
            fontSize = 14.sp,
            modifier = Modifier.padding(start = 8.dp, top = 4.dp),
            lineHeight = 20.sp
        )
    }
}

@Preview(showBackground = true)
@Composable
fun AboutScreenPreview() {
    AboutScreen()
}
