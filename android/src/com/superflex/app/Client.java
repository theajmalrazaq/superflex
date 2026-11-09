package com.superflex.app;

import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class Client extends WebViewClient {
    static final String VIRTUAL = "/__superflex__/";
    final MainActivity owner;

    public Client(MainActivity owner) {
        this.owner = owner;
    }

    private static String mime(String path) {
        if (path.endsWith(".js")) return "text/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    private static boolean portal(Uri uri) {
        if (uri == null) return false;
        return "https".equals(uri.getScheme()) && "flexstudent.nu.edu.pk".equals(uri.getHost());
    }

    WebResourceResponse missing() {
        Map<String, String> headers = new HashMap<>();
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers, new ByteArrayInputStream(new byte[0]));
    }

    WebResourceResponse serve(String path) {
        String sub = path.substring(VIRTUAL.length());
        if (sub.length() == 0 || sub.contains("..") || sub.contains("\\")) {
            return missing();
        }
        try {
            AssetManager assets = owner.getAssets();
            InputStream stream = assets.open("web/" + sub);
            Map<String, String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-cache");
            headers.put("Access-Control-Allow-Origin", "*");
            return new WebResourceResponse(mime(sub), "utf-8", 200, "OK", headers, stream);
        } catch (Exception e) {
            return missing();
        }
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        if (portal(uri) && "GET".equals(request.getMethod())) {
            String path = uri.getPath();
            if (path != null && path.startsWith(VIRTUAL)) {
                return serve(path);
            }
        }
        return null;
    }

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        Uri uri = Uri.parse(url);
        if (portal(uri)) {
            owner.bridge.trusted = true;
            owner.failed = false;
            view.evaluateJavascript(owner.early, null);
        }
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        Uri uri = Uri.parse(url);
        if (portal(uri)) {
            if (!owner.failed) {
                view.evaluateJavascript(owner.early, null);
                view.evaluateJavascript(owner.main, null);
            }
            owner.perform();
        }
    }

    @Override
    public void onReceivedSslError(WebView view, android.webkit.SslErrorHandler handler, android.net.http.SslError error) {
        String url = error != null ? error.getUrl() : null;
        if (url != null && (url.contains("nu.edu.pk") || url.contains("challenges.cloudflare.com"))) {
            handler.proceed();
        } else {
            handler.cancel();
        }
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        if (request.isForMainFrame()) {
            owner.offline();
        }
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        Uri uri = Uri.parse(url);
        if (portal(uri)) return false;
        if ("http".equals(uri.getScheme()) && "flexstudent.nu.edu.pk".equals(uri.getHost())) {
            view.loadUrl(uri.buildUpon().scheme("https").build().toString());
            return true;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            owner.startActivity(intent);
        } catch (Exception ignored) {}
        return true;
    }
}
