package com.superflex.app;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient.FileChooserParams;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

public class MainActivity extends Activity implements View.OnClickListener {
    static final String HOST = "flexstudent.nu.edu.pk";
    static final String HOME = "https://flexstudent.nu.edu.pk/Login";
    static final int LIGHT = Color.parseColor("#FFFFFF");
    static final int NIGHT = Color.parseColor("#0B0B0F");
    static final int GRANT = 101;
    static final int PICK = 102;

    FrameLayout root;
    WebView webview;
    FrameLayout splash;
    LinearLayout problem;
    Button retry;

    Bridge bridge;
    ValueCallback<Uri[]> chooser;
    String early = "";
    String bridgeScript = "";
    String bundle = "";
    boolean failed = false;
    boolean shown = false;
    boolean dark = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        dark = systemdark();
        early = readasset("web/early.js");
        bridgeScript = readasset("web/bridge.js");
        bundle = readasset("web/superflex.js");

        root = new FrameLayout(this);
        root.setFitsSystemWindows(true);

        webview = new WebView(this);
        settings(webview);

        bridge = new Bridge(this);
        webview.addJavascriptInterface(bridge, "SFNative");
        webview.setWebViewClient(new Client(this));
        webview.setWebChromeClient(new Chrome(this));
        webview.setDownloadListener(new Loader(this));

        makesplash();
        makeproblem();

        root.addView(webview, new FrameLayout.LayoutParams(-1, -1));
        root.addView(problem, new FrameLayout.LayoutParams(-1, -1));
        root.addView(splash, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        style(dark);
        askstorage();

        if (savedInstanceState != null) {
            webview.restoreState(savedInstanceState);
        } else {
            webview.loadUrl(HOME);
        }

        // Safety fallback: dismiss splash after 4s max if network lags or offline
        root.postDelayed(new Runnable() {
            @Override
            public void run() {
                perform();
            }
        }, 4000);
    }

    String readasset(String path) {
        try {
            InputStream is = getAssets().open(path);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int len;
            while ((len = is.read(buf)) != -1) {
                baos.write(buf, 0, len);
            }
            is.close();
            return baos.toString("UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    void settings(WebView v) {
        WebSettings s = v.getSettings();
        s.setJavaScriptEnabled(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setSupportMultipleWindows(false);
        s.setGeolocationEnabled(false);
        s.setSaveFormData(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Normalize User-Agent to avoid Cloudflare Turnstile blocking embedded WebViews
        String ua = s.getUserAgentString();
        if (ua != null) {
            ua = ua.replace("; wv", "");
            ua = ua.replaceAll("Version/\\d+\\.\\d+\\s*", "");
            s.setUserAgentString(ua);
        }

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(v, true);

        WebView.setWebContentsDebuggingEnabled(true);
    }

    void makesplash() {
        splash = new FrameLayout(this);
        int bg = dark ? NIGHT : LIGHT;
        splash.setBackgroundColor(bg);
        ImageView img = new ImageView(this);
        img.setImageResource(R.drawable.logo);
        int sz = px(120);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(sz, sz, Gravity.CENTER);
        splash.addView(img, lp);
        splash.setClickable(true);
    }

    void makeproblem() {
        problem = new LinearLayout(this);
        problem.setOrientation(LinearLayout.VERTICAL);
        problem.setGravity(Gravity.CENTER);
        int p = px(24);
        problem.setPadding(p, p, p, p);
        problem.setBackgroundColor(NIGHT);

        TextView title = new TextView(this);
        title.setText(R.string.offline_title);
        title.setTextSize(20);
        title.setTextColor(Color.WHITE);
        title.setGravity(Gravity.CENTER);
        problem.addView(title);

        TextView body = new TextView(this);
        body.setText(R.string.offline_body);
        body.setTextSize(14);
        body.setTextColor(Color.GRAY);
        body.setGravity(Gravity.CENTER);
        body.setPadding(0, px(8), 0, px(24));
        problem.addView(body);

        retry = new Button(this);
        retry.setText(R.string.retry);
        retry.setOnClickListener(this);
        problem.addView(retry);

        problem.setVisibility(View.GONE);
        problem.setClickable(true);
    }

    int px(float dp) {
        return (int) (dp * getResources().getDisplayMetrics().density + 0.5f);
    }

    boolean systemdark() {
        int mode = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return mode == Configuration.UI_MODE_NIGHT_YES;
    }

    public void style(boolean isDark) {
        dark = isDark;
        Window w = getWindow();
        int bg = isDark ? NIGHT : LIGHT;
        w.setStatusBarColor(bg);
        w.setNavigationBarColor(bg);
        View decor = w.getDecorView();
        int flags = decor.getSystemUiVisibility();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (isDark) {
                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            } else {
                flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (isDark) {
                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            } else {
                flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
        }
        decor.setSystemUiVisibility(flags);
        root.setBackgroundColor(bg);
        webview.setBackgroundColor(bg);
        if (splash != null && !shown) {
            splash.setBackgroundColor(bg);
        }
    }

    public void perform() {
        if (!shown) {
            shown = true;
            splash.animate().alpha(0f).setDuration(250).withEndAction(new Runnable() {
                @Override
                public void run() {
                    splash.setVisibility(View.GONE);
                }
            }).start();
        }
    }

    public void offline() {
        failed = true;
        webview.stopLoading();
        problem.setVisibility(View.VISIBLE);
        perform();
    }

    @Override
    public void onClick(View v) {
        if (v == retry) {
            problem.setVisibility(View.GONE);
            failed = false;
            String url = webview.getUrl();
            if (url == null || url.startsWith("data:") || !url.contains(HOST)) {
                webview.loadUrl(HOME);
            } else {
                webview.reload();
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (problem.getVisibility() == View.VISIBLE) {
            super.onBackPressed();
            return;
        }
        if (webview.canGoBack()) {
            webview.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
        webview.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webview.onResume();
    }

    @Override
    protected void onDestroy() {
        if (chooser != null) {
            chooser.onReceiveValue(null);
            chooser = null;
        }
        root.removeView(webview);
        webview.removeJavascriptInterface("SFNative");
        webview.destroy();
        super.onDestroy();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webview.saveState(outState);
    }

    boolean pick(ValueCallback<Uri[]> callback, FileChooserParams params) {
        if (chooser != null) chooser.onReceiveValue(null);
        chooser = callback;
        try {
            Intent intent = params.createIntent();
            startActivityForResult(intent, PICK);
            return true;
        } catch (Exception e) {
            chooser = null;
            return false;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == PICK) {
            if (chooser != null) {
                chooser.onReceiveValue(FileChooserParams.parseResult(resultCode, data));
                chooser = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    void askstorage() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
            if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, GRANT);
            }
        }
    }

    void save(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        try {
            Uri uri = Uri.parse(url);
            if (!"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost())) {
                Toast.makeText(this, R.string.blocked, Toast.LENGTH_SHORT).show();
                return;
            }
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request req = new DownloadManager.Request(uri);
            String cookie = CookieManager.getInstance().getCookie(url);
            if (cookie != null) req.addRequestHeader("Cookie", cookie);
            if (userAgent != null) req.addRequestHeader("User-Agent", userAgent);
            req.addRequestHeader("Referer", HOME);

            String fileName = URLUtil.guessFileName(url, contentDisposition, mimeType);
            if (mimeType != null && mimeType.length() > 0) req.setMimeType(mimeType);
            req.setTitle(fileName);
            req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

            dm.enqueue(req);
            Toast.makeText(this, R.string.saving, Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(this, e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }
}
