package com.musa.melodyflow

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)

        // Configure WebView settings
        webView.settings.apply {
            javaScriptEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            domStorageEnabled = true
            // Required for loading local file-based assets
            setAllowFileAccessFromFileURLs(true)
            setAllowUniversalAccessFromFileURLs(true)
        }

        // Set a custom WebViewClient to handle navigation for the SPA
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()

                // Let the WebView handle loading its own local asset files
                if (url.startsWith("file:///android_asset/")) {
                    return false
                }

                // Redirect all other navigation events back to the main index.html
                // to let the client-side router handle the path.
                if (!url.startsWith("http")) {
                    view.loadUrl("file:///android_asset/website/index.html")
                    return true
                }

                // For external links (http/https), let the default behavior take over.
                return super.shouldOverrideUrlLoading(view, request)
            }
        }

        // Load the local React app's entry point
        webView.loadUrl("file:///android_asset/website/index.html")
    }
}
