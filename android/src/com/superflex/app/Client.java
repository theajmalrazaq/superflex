package com.superflex.app;

import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.SslErrorHandler;
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

    static boolean portal(Uri uri) {
        return uri != null && "https".equals(uri.getScheme()) && MainActivity.HOST.equals(uri.getHost());
    }

    static String mime(String name) {
        if (name.endsWith(".js")) return "text/javascript";
        if (name.endsWith(".css")) return "text/css";
        if (name.endsWith(".json")) return "application/json";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    WebResourceResponse missing() {
        Map<String, String> heads = new HashMap<>();
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", heads, new ByteArrayInputStream(new byte[0]));
    }

    WebResourceResponse serve(String path) {
        String name = path.substring(VIRTUAL.length());
        if (name.length() == 0 || name.contains("..") || name.contains("\\")) return missing();
        try {
            AssetManager assets = owner.getAssets();
            InputStream stream = assets.open("web/" + name);
            Map<String, String> heads = new HashMap<>();
            heads.put("Cache-Control", "no-cache");
            heads.put("Access-Control-Allow-Origin", "*");
            return new WebResourceResponse(mime(name), "utf-8", 200, "OK", heads, stream);
        } catch (Exception error) {
            return missing();
        }
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (request != null && request.getUrl() != null) {
            Uri uri = request.getUrl();
            if (portal(uri) && "GET".equals(request.getMethod())) {
                String path = uri.getPath();
                if (path != null && path.startsWith(VIRTUAL)) {
                    return serve(path);
                }
            }
        }
        return super.shouldInterceptRequest(view, request);
    }

    @Override
    public void onPageCommitVisible(WebView view, String url) {
        if (portal(Uri.parse(url))) {
            view.evaluateJavascript(owner.early, null);
        }
    }

    @Override
    public void onPageStarted(WebView view, String url, Bitmap icon) {
        boolean trusted = portal(Uri.parse(url));
        owner.bridge.trusted = trusted;
        owner.failed = false;
        owner.cover();
        if (trusted) {
            view.evaluateJavascript(owner.early, null);
        }
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        boolean trusted = portal(Uri.parse(url));
        if (owner.failed) return;
        owner.crashes = 0;
        if (trusted) {
            view.evaluateJavascript(owner.main, null);
        } else {
            owner.perform();
        }
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        Uri uri = Uri.parse(url);
        if (portal(uri)) return false;
        if ("http".equals(uri.getScheme()) && MainActivity.HOST.equals(uri.getHost())) {
            view.loadUrl(uri.buildUpon().scheme("https").build().toString());
            return true;
        }
        String scheme = uri.getScheme();
        boolean allowed = "https".equals(scheme) || "http".equals(scheme) || "mailto".equals(scheme) || "tel".equals(scheme);
        if (!allowed) return true;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            owner.startActivity(intent);
        } catch (Exception ignored) {}
        return true;
    }

    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, android.net.http.SslError error) {
        String url = error != null ? error.getUrl() : null;
        if (url != null && (url.contains("nu.edu.pk") || url.contains("challenges.cloudflare.com"))) {
            handler.proceed();
        } else {
            handler.cancel();
        }
    }

    @Override
    public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
        owner.revive();
        return true;
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        if (request != null && request.isForMainFrame()) {
            owner.offline();
        }
    }
}
