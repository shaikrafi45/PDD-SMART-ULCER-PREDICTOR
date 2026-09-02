package com.example.smartulcerpredictor.ui

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class AnalysisResult(
    val label: String,
    val confidence: Float,
    val image: Bitmap? = null,
    val tissueBreakdown: Map<String, Float> = emptyMap()
)

class MainViewModel : ViewModel() {
    private val _analysisResult = MutableStateFlow<AnalysisResult?>(null)
    val analysisResult: StateFlow<AnalysisResult?> = _analysisResult.asStateFlow()

    fun setAnalysisResult(result: AnalysisResult) {
        _analysisResult.value = result
    }
}
