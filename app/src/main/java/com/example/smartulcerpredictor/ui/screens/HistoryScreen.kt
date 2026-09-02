package com.example.smartulcerpredictor.ui.screens

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smartulcerpredictor.R
import com.example.smartulcerpredictor.data.api.RetrofitClient
import com.example.smartulcerpredictor.data.api.UserSession
import com.example.smartulcerpredictor.data.model.HistoryNetworkItem
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

fun formatIsoDate(isoDate: String?): String {
    if (isoDate.isNullOrBlank()) return "Recently"
    return try {
        val cleanDate = isoDate.trim()
        val formats = listOf(
            SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()),
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()),
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS", Locale.getDefault()),
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault()),
            SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        )
        
        var parsedDate: Date? = null
        for (fmt in formats) {
            try {
                parsedDate = fmt.parse(cleanDate)
                if (parsedDate != null) break
            } catch (_: Exception) {}
        }
        
        if (parsedDate != null) {
            val outputFormat = SimpleDateFormat("EEEE, dd MMM yyyy • hh:mm a", Locale.getDefault())
            outputFormat.format(parsedDate)
        } else {
            cleanDate
        }
    } catch (e: Exception) {
        isoDate ?: "Recently"
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(onBack: () -> Unit = {}) {
    var historyList by remember { mutableStateOf<List<HistoryNetworkItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var hasError by remember { mutableStateOf(false) }
    
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        if (UserSession.userId <= 0) {
            Toast.makeText(context, "Session invalid. Please log in.", Toast.LENGTH_SHORT).show()
            isLoading = false
            hasError = true
            return@LaunchedEffect
        }
        coroutineScope.launch {
            try {
                val response = RetrofitClient.instance.getHistory(UserSession.userId)
                isLoading = false
                if (response.isSuccessful && response.body()?.status == "success") {
                    historyList = response.body()?.history ?: emptyList()
                } else {
                    hasError = true
                    Toast.makeText(context, "Failed to retrieve history.", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                isLoading = false
                hasError = true
                Toast.makeText(context, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    Scaffold(
        containerColor = Color(0xFFFBFBFB),
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "History",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                },
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
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFFBFBFB))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFFBFBFB))
        ) {
            Text(
                text = "Your Wound History",
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF1976D2))
                }
            } else if (hasError) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = "Unable to load scan history.", color = Color.Gray, fontSize = 16.sp)
                }
            } else if (historyList.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = "No scans logged yet.", color = Color.Gray, fontSize = 16.sp)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(historyList) { item ->
                        HistoryCard(item)
                    }
                }
            }
        }
    }
}

@Composable
fun HistoryCard(item: HistoryNetworkItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Edit,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = Color.LightGray
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Result: ${item.result}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "Confidence: ${item.confidence}%",
                color = Color.DarkGray,
                fontSize = 14.sp,
                modifier = Modifier.padding(start = 28.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Historical Image loaded from backend server URL
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.LightGray)
            ) {
                NetworkImage(url = item.image_path)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.CalendarMonth,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = Color(0xFF1976D2)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Date & Time: ${formatIsoDate(item.date)}",
                    color = Color(0xFF424242),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun HistoryScreenPreview() {
    HistoryScreen()
}
