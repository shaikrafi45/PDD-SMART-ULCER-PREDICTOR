


package com.example.smartulcerpredictor.data.api

import android.content.Context
import android.content.SharedPreferences
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Current Host API URL
    const val BASE_URL = "http://10.85.130.155/smart_ulcer_api/"

    fun resolveImageUrl(rawUrl: String?): String {
        if (rawUrl.isNullOrEmpty()) return ""
        if (rawUrl.contains("uploads/")) {
            val relPath = rawUrl.substring(rawUrl.indexOf("uploads/"))
            return "${BASE_URL}$relPath"
        }
        return rawUrl
    }

    val instance: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        retrofit.create(ApiService::class.java)
    }
}

/**
 * A session manager that persists user data to SharedPreferences so the
 * user stays logged in across app restarts until they explicitly log out.
 */
object UserSession {
    private const val PREFS_NAME = "smart_ulcer_prefs"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_USER_NAME = "user_name"
    private const val KEY_USER_EMAIL = "user_email"

    private lateinit var prefs: SharedPreferences

    var userId: Int = -1
        private set
    var userName: String = ""
        private set
    var userEmail: String = ""
        private set

    // Stores the email used during the forgot password request
    var lastResetEmail: String = ""

    // Stores the latest classification result
    var latestPrediction: com.example.smartulcerpredictor.data.model.UploadData? = null

    /** Call once from MainActivity.onCreate to load persisted session. */
    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        userId = prefs.getInt(KEY_USER_ID, -1)
        userName = prefs.getString(KEY_USER_NAME, "") ?: ""
        userEmail = prefs.getString(KEY_USER_EMAIL, "") ?: ""
    }

    /** Save user data after a successful login or registration. */
    fun login(id: Int, name: String, email: String) {
        userId = id
        userName = name
        userEmail = email
        prefs.edit()
            .putInt(KEY_USER_ID, id)
            .putString(KEY_USER_NAME, name)
            .putString(KEY_USER_EMAIL, email)
            .apply()
    }

    fun isLoggedIn(): Boolean = userId != -1

    /** Clear persisted session – called on logout. */
    fun clear() {
        userId = -1
        userName = ""
        userEmail = ""
        lastResetEmail = ""
        latestPrediction = null
        prefs.edit().clear().apply()
    }
}

/**
 * Extension helper to extract the "message" string from a Retrofit Response,
 * either from the parsed body (if successful) or from the JSON error body (if unsuccessful).
 */
fun <T> retrofit2.Response<T>.getErrorMsg(defaultMsg: String): String {
    if (isSuccessful) {
        val body = body()
        if (body != null) {
            val messageVal = try {
                body.javaClass.methods.firstOrNull { it.name == "getMessage" }?.invoke(body) as? String
            } catch (e: Exception) {
                null
            }
            if (messageVal != null) return messageVal
        }
    }
    return try {
        val errorStr = errorBody()?.string()
        if (!errorStr.isNullOrEmpty()) {
            val json = org.json.JSONObject(errorStr)
            json.optString("message", defaultMsg)
        } else {
            defaultMsg
        }
    } catch (e: Exception) {
        defaultMsg
    }
}


