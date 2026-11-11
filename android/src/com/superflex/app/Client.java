package com.superflex.app;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;

/* JADX INFO: loaded from: /tmp/claude_apk/classes.dex */
public class Client extends WebViewClient {
    static final String VIRTUAL = "/__superflex__/";
    MainActivity owner;

    Client(MainActivity mainActivity) {
        this.owner = mainActivity;
    }

    static boolean portal(Uri uri) {
        return uri != null && "https".equals(uri.getScheme()) && "flexstudent.nu.edu.pk".equals(uri.getHost());
    }

    static String mime(String str) {
        if (str.endsWith(".js")) {
            return "text/javascript";
        }
        if (str.endsWith(".css")) {
            return "text/css";
        }
        if (str.endsWith(".json")) {
            return "application/json";
        }
        if (str.endsWith(".png")) {
            return "image/png";
        }
        if (str.endsWith(".svg")) {
            return "image/svg+xml";
        }
        return str.endsWith(".webp") ? "image/webp" : "application/octet-stream";
    }

    WebResourceResponse missing() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }

    WebResourceResponse serve(String str) {
        InputStream inputStreamOpen;
        String strSubstring = str.substring(VIRTUAL.length());
        if (strSubstring.length() == 0 || strSubstring.contains("..") || strSubstring.contains("\\")) {
            return missing();
        }
        try {
            File fileResolve = Updater.resolve(this.owner.getFilesDir(), strSubstring);
            if (fileResolve != null) {
                inputStreamOpen = new FileInputStream(fileResolve);
            } else {
                inputStreamOpen = this.owner.getAssets().open("web/" + strSubstring);
            }
            HashMap<String, String> map = new HashMap<String, String>();
            map.put("Cache-Control", "no-cache");
            return new WebResourceResponse(mime(strSubstring), "utf-8", 200, "OK", map, inputStreamOpen);
        } catch (Exception e) {
            return missing();
        }
    }

    @Override // android.webkit.WebViewClient
    public WebResourceResponse shouldInterceptRequest(WebView webView, WebResourceRequest webResourceRequest) {
        String path;
        Uri url = webResourceRequest.getUrl();
        if (portal(url) && "GET".equals(webResourceRequest.getMethod()) && (path = url.getPath()) != null && path.startsWith(VIRTUAL)) {
            return serve(path);
        }
        return null;
    }

    @Override // android.webkit.WebViewClient
    public boolean shouldOverrideUrlLoading(WebView webView, String str) {
        Uri uri = Uri.parse(str);
        if (portal(uri)) {
            return false;
        }
        if ("http".equals(uri.getScheme()) && "flexstudent.nu.edu.pk".equals(uri.getHost())) {
            webView.loadUrl(uri.buildUpon().scheme("https").build().toString());
            return true;
        }
        String scheme = uri.getScheme();
        if (!("https".equals(scheme) || "http".equals(scheme) || "mailto".equals(scheme) || "tel".equals(scheme))) {
            return true;
        }
        try {
            Intent intent = new Intent("android.intent.action.VIEW", uri);
            intent.addCategory("android.intent.category.BROWSABLE");
            this.owner.startActivity(intent);
            return true;
        } catch (Exception e) {
            return true;
        }
    }

    @Override // android.webkit.WebViewClient
    public void onPageStarted(WebView webView, String str, Bitmap bitmap) {
        boolean zPortal = portal(Uri.parse(str));
        this.owner.bridge.trusted = zPortal;
        this.owner.failed = false;
        if (zPortal) {
            this.owner.perform(4);
            webView.evaluateJavascript(this.owner.early, null);
        }
    }

    @Override // android.webkit.WebViewClient
    public void onPageCommitVisible(WebView webView, String str) {
        if (portal(Uri.parse(str))) {
            webView.evaluateJavascript(this.owner.early, null);
        }
    }

    @Override // android.webkit.WebViewClient
    public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail renderProcessGoneDetail) {
        this.owner.revive(webView);
        return true;
    }

    @Override // android.webkit.WebViewClient
    public void onPageFinished(WebView webView, String str) {
        boolean zPortal = portal(Uri.parse(str));
        if (!this.owner.failed) {
            this.owner.crashes = 0;
            if (zPortal) {
                webView.evaluateJavascript(this.owner.main, null);
            } else {
                this.owner.perform(1);
            }
        }
    }

    @Override // android.webkit.WebViewClient
    public void onReceivedError(WebView webView, WebResourceRequest webResourceRequest, WebResourceError webResourceError) {
        if (webResourceRequest.isForMainFrame()) {
            this.owner.offline();
        }
    }
}
