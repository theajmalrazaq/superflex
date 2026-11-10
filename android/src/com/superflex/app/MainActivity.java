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
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebChromeClient.FileChooserParams;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

public class MainActivity extends Activity implements View.OnClickListener {
    static final String HOST = "flexstudent.nu.edu.pk";
    static final String HOME = "https://flexstudent.nu.edu.pk/Login";
    static final String REFERER = "https://flexstudent.nu.edu.pk/";
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
    String main = "";
    volatile boolean dark = false;
    boolean failed = false;
    boolean shown = true;
    int crashes = 0;
    Task limitTask = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        dark = systemdark();
        early = readasset("web/early.js");
        main = readasset("web/main.js");

        root = new FrameLayout(this);
        root.setFitsSystemWindows(true);

        bridge = new Bridge(this);

        webview = new WebView(this);
        settings(webview);
        webview.addJavascriptInterface(bridge, "SFNative");
        webview.setWebViewClient(new Client(this));
        webview.setWebChromeClient(new Chrome(this));
        webview.setDownloadListener(new Loader(this));

        splash = makesplash();
        problem = makeproblem();

        ViewGroup.LayoutParams fill = new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        root.addView(webview, fill);
        root.addView(problem, fill);
        root.addView(splash, fill);
        setContentView(root);

        style(dark);
        askstorage();

        boolean restored = false;
        if (savedInstanceState != null) {
            restored = webview.restoreState(savedInstanceState) != null;
        }
        if (!restored) {
            webview.loadUrl(HOME);
        }

        // Safety fallback: dismiss splash after 8s max if network lags or offline
        limitTask = new Task(this, 1);
        splash.postDelayed(limitTask, 8000);
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

        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }

    FrameLayout makesplash() {
        FrameLayout layer = new FrameLayout(this);
        int bg = dark ? NIGHT : LIGHT;
        layer.setBackgroundColor(bg);

        ImageView img = new ImageView(this);
        img.setImageResource(R.drawable.logo);
        int sz = px(112);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(sz, sz, Gravity.CENTER);
        layer.addView(img, lp);

        ProgressBar spin = new ProgressBar(this);
        FrameLayout.LayoutParams spinbox = new FrameLayout.LayoutParams(px(32), px(32), Gravity.CENTER_HORIZONTAL | Gravity.BOTTOM);
        spinbox.bottomMargin = px(96);
        layer.addView(spin, spinbox);

        layer.setClickable(true);
        return layer;
    }

    LinearLayout makeproblem() {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        int p = px(32);
        box.setPadding(p, p, p, p);
        box.setBackgroundColor(NIGHT);

        TextView title = new TextView(this);
        title.setText(R.string.offline_title);
        title.setTextSize(20);
        title.setTextColor(Color.WHITE);
        title.setGravity(Gravity.CENTER);
        box.addView(title);

        TextView body = new TextView(this);
        body.setText(R.string.offline_body);
        body.setTextSize(14);
        body.setTextColor(Color.GRAY);
        body.setGravity(Gravity.CENTER);
        body.setPadding(0, px(8), 0, px(24));
        box.addView(body);

        retry = new Button(this);
        retry.setText(R.string.retry);
        retry.setOnClickListener(this);
        box.addView(retry);

        box.setVisibility(View.GONE);
        box.setClickable(true);
        return box;
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
        if (splash != null && shown) {
            splash.setBackgroundColor(bg);
        }
    }

    public void cover() {
        if (splash != null) {
            int bg = dark ? NIGHT : LIGHT;
            splash.setBackgroundColor(bg);
            splash.setVisibility(View.VISIBLE);
            splash.setAlpha(1.0f);
            if (limitTask != null) {
                splash.removeCallbacks(limitTask);
            }
            limitTask = new Task(this, 1);
            splash.postDelayed(limitTask, 8000);
        }
    }

    public void perform(int kind) {
        if (kind == 1) perform();
        if (kind == 2) style(dark);
    }

    public void perform() {
        if (failed) return;
        if (splash != null && splash.getVisibility() == View.VISIBLE) {
            splash.animate().alpha(0f).setDuration(250).withEndAction(new Runnable() {
                @Override
                public void run() {
                    splash.setVisibility(View.GONE);
                    splash.setAlpha(1.0f);
                }
            }).start();
        }
        shown = false;
    }

    public void revive() {
        crashes++;
        if (crashes > 3) {
            offline();
            return;
        }
        try {
            root.removeView(webview);
            webview.removeJavascriptInterface("SFNative");
            webview.destroy();
        } catch (Exception ignored) {}
        webview = new WebView(this);
        settings(webview);
        webview.addJavascriptInterface(bridge, "SFNative");
        webview.setWebViewClient(new Client(this));
        webview.setWebChromeClient(new Chrome(this));
        webview.setDownloadListener(new Loader(this));
        root.addView(webview, 0, new FrameLayout.LayoutParams(-1, -1));
        cover();
        webview.loadUrl(HOME);
    }

    public void offline() {
        failed = true;
        webview.stopLoading();
        if (splash != null) splash.setVisibility(View.GONE);
        problem.setVisibility(View.VISIBLE);
    }

    @Override
    public void onClick(View v) {
        if (v == retry) {
            problem.setVisibility(View.GONE);
            failed = false;
            cover();
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
        if (limitTask != null && splash != null) {
            splash.removeCallbacks(limitTask);
            limitTask = null;
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
            if (!Client.portal(uri)) {
                Toast.makeText(this, R.string.blocked, Toast.LENGTH_SHORT).show();
                return;
            }
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request req = new DownloadManager.Request(uri);
            String cookie = CookieManager.getInstance().getCookie(url);
            if (cookie != null) req.addRequestHeader("Cookie", cookie);
            if (userAgent != null) req.addRequestHeader("User-Agent", userAgent);
            req.addRequestHeader("Referer", REFERER);

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
