package com.musa.melodyflow

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import java.io.File
import java.util.zip.ZipInputStream

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val uris = result.data?.let { data ->
                if (data.data != null) {
                    arrayOf(data.data!!)
                } else {
                    val clipData = data.clipData
                    if (clipData != null) {
                        Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                    } else {
                        null
                    }
                }
            }
            filePathCallback?.onReceiveValue(uris ?: arrayOf())
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)

        // Unzip website content on first launch
        val websiteDir = File(filesDir, "website")
        if (!websiteDir.exists()) {
            unzipWebsite()
        }

        // Configure WebView settings
        webView.settings.apply {
            javaScriptEnabled = true
            allowFileAccess = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams
            ): Boolean {
                this@MainActivity.filePathCallback = filePathCallback
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                }
                fileChooserLauncher.launch(intent)
                return true
            }
        }

        // Set a custom WebViewClient to handle navigation for the SPA
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                val webDir = File(filesDir, "website")

                if (url.startsWith("file://${webDir.absolutePath}")) {
                    return false
                }

                if (!url.startsWith("http")) {
                    view.loadUrl("file://${webDir.absolutePath}/index.html")
                    return true
                }

                return super.shouldOverrideUrlLoading(view, request)
            }
        }

        // Load the local React app's entry point
        val indexPath = File(websiteDir, "index.html").absolutePath
        webView.loadUrl("file:///$indexPath")
    }

    private fun unzipWebsite() {
        val websiteDir = File(filesDir, "website")
        websiteDir.mkdirs()

        try {
            assets.open("website.zip").use { inputStream ->
                ZipInputStream(inputStream).use { zipInputStream ->
                    var entry = zipInputStream.nextEntry
                    while (entry != null) {
                        val file = File(websiteDir, entry.name)
                        if (entry.isDirectory) {
                            if (!file.exists()) {
                                file.mkdirs()
                            }
                        } else {
                            file.outputStream().use { fileOutputStream ->
                                zipInputStream.copyTo(fileOutputStream)
                            }
                        }
                        zipInputStream.closeEntry()
                        entry = zipInputStream.nextEntry
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
