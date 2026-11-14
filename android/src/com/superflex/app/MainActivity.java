package com.superflex.app;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.HashMap;

/* JADX INFO: loaded from: /tmp/claude_apk/classes.dex */
public class MainActivity extends Activity implements View.OnClickListener {
    static final int GRANT = 8;
    static final String HOME = "https://flexstudent.nu.edu.pk/Login";
    static final String HOST = "flexstudent.nu.edu.pk";
    static final int LIGHT = -1;
    static final int NIGHT = Color.BLACK;
    static final int PICK = 7;
    static final long SPLASH_FADE_MS = 600L;
    static final String SPLASH_HOST = "splash.superflex.local";
    static final long SPLASH_LIMIT_MS = 20000L;
    static final long SPLASH_MIN_MS = 1400L;
    static final long SPLASH_SETTLE_MS = 350L;
    Bridge bridge;
    ValueCallback<Uri[]> chooser;
    Task limit;
    LinearLayout problem;
    Button retry;
    FrameLayout root;
    WebView splash;
    Bundle state;
    WebView webview;
    String early = "";
    String main = "";
    volatile boolean dark = false;
    boolean failed = false;
    boolean hiding = false;
    boolean revealing = false;
    boolean shown = true;
    boolean started = false;
    int crashes = 0;
    boolean gone = false;
    long coverAt = 0L;
    final Runnable splashReveal = new Runnable() {
        @Override
        public void run() {
            MainActivity.this.perform(5);
        }
    };
    final Runnable splashHide = new Runnable() {
        @Override
        public void run() {
            if (MainActivity.this.splash != null && MainActivity.this.hiding) {
                MainActivity.this.splash.setVisibility(View.GONE);
                MainActivity.this.hiding = false;
            }
        }
    };

    String readasset(String str) {
        InputStream inputStreamOpen;
        try {
            File fileResolve = Updater.resolve(getFilesDir(), str.substring(4));
            if (fileResolve != null) {
                inputStreamOpen = new FileInputStream(fileResolve);
            } else {
                inputStreamOpen = getAssets().open(str);
            }
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            byte[] bArr = new byte[8192];
            for (int i = inputStreamOpen.read(bArr); i != LIGHT; i = inputStreamOpen.read(bArr)) {
                byteArrayOutputStream.write(bArr, 0, i);
            }
            inputStreamOpen.close();
            return byteArrayOutputStream.toString("UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    boolean initialdark() {
        android.content.SharedPreferences prefs = getSharedPreferences("superflex_prefs", MODE_PRIVATE);
        if (prefs.contains("theme_dark")) {
            return prefs.getBoolean("theme_dark", false);
        }
        return systemdark();
    }

    boolean systemdark() {
        return (getResources().getConfiguration().uiMode & 48) == 32;
    }

    int px(int i) {
        return (int) (i * getResources().getDisplayMetrics().density);
    }

    void updateSplashTheme(boolean night) {
        if (this.splash != null) {
            this.splash.evaluateJavascript("if (window.setTheme) window.setTheme(" + night + ");", null);
        }
    }

    void style(boolean z) {
        int i = z ? NIGHT : LIGHT;
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        if (!z) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        getWindow().getDecorView().setSystemUiVisibility(flags);
        this.root.setBackgroundColor(i);
        this.webview.setBackgroundColor(i);
        updateSplashTheme(z);
    }

    WebView makesplash() {
        WebView view = new WebView(this);
        WebSettings ws = view.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(false);
        ws.setDatabaseEnabled(false);
        ws.setAllowFileAccess(false);
        ws.setAllowContentAccess(false);
        ws.setAllowFileAccessFromFileURLs(false);
        ws.setAllowUniversalAccessFromFileURLs(false);
        ws.setGeolocationEnabled(false);
        ws.setSaveFormData(false);
        ws.setSupportZoom(false);
        ws.setBuiltInZoomControls(false);
        ws.setCacheMode(WebSettings.LOAD_NO_CACHE);

        view.setBackgroundColor(Color.TRANSPARENT);
        view.setOverScrollMode(View.OVER_SCROLL_NEVER);
        view.setVerticalScrollBarEnabled(false);
        view.setHorizontalScrollBarEnabled(false);
        view.setLongClickable(false);
        view.setHapticFeedbackEnabled(false);
        view.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                return v.getVisibility() == View.VISIBLE;
            }
        });

        view.setWebViewClient(new WebViewClient() {
            WebResourceResponse emptyNotFound() {
                return new WebResourceResponse(
                    "text/plain",
                    "utf-8",
                    404,
                    "Not Found",
                    new HashMap<String, String>(),
                    new ByteArrayInputStream(new byte[0])
                );
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView webView, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (
                    url == null
                        || !"https".equals(url.getScheme())
                        || !SPLASH_HOST.equals(url.getHost())
                        || !"GET".equals(request.getMethod())
                ) {
                    return emptyNotFound();
                }
                String path = url.getPath();
                if (path == null || path.length() <= 1 || path.contains("..") || path.contains("\\")) {
                    return emptyNotFound();
                }
                String rel = path.substring(1);
                try {
                    File resolved = Updater.resolve(MainActivity.this.getFilesDir(), rel);
                    InputStream stream = resolved != null
                        ? new FileInputStream(resolved)
                        : MainActivity.this.getAssets().open("web/" + rel);
                    HashMap<String, String> headers = new HashMap<String, String>();
                    headers.put("Cache-Control", "no-store");
                    return new WebResourceResponse(Client.mime(rel), "utf-8", 200, "OK", headers, stream);
                } catch (Exception e) {
                    return emptyNotFound();
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView webView, String url) {
                return true;
            }

            @Override
            public void onPageFinished(WebView webView, String url) {
                webView.evaluateJavascript("if (window.setTheme) window.setTheme(" + MainActivity.this.dark + ");", null);
                if (!MainActivity.this.shown) {
                    webView.evaluateJavascript("if (window.fadeOutSplash) window.fadeOutSplash();", null);
                }
            }
        });

        view.loadUrl("https://" + SPLASH_HOST + "/splash.html?theme=" + (this.dark ? "dark" : "light"));
        return view;
    }

    LinearLayout makeproblem() {
        LinearLayout linearLayout = new LinearLayout(this);
        linearLayout.setOrientation(1);
        linearLayout.setGravity(17);
        linearLayout.setPadding(px(32), px(32), px(32), px(32));
        linearLayout.setBackgroundResource(R.color.back);
        TextView textView = new TextView(this);
        textView.setText(R.string.offline_title);
        textView.setTextSize(20.0f);
        textView.setGravity(17);
        textView.setTextColor(getResources().getColor(R.color.front));
        TextView textView2 = new TextView(this);
        textView2.setText(R.string.offline_body);
        textView2.setGravity(17);
        textView2.setTextColor(getResources().getColor(R.color.front));
        textView2.setPadding(0, px(GRANT), 0, px(24));
        this.retry = new Button(this);
        this.retry.setText(R.string.retry);
        this.retry.setOnClickListener(this);
        linearLayout.addView(textView);
        linearLayout.addView(textView2);
        linearLayout.addView(this.retry);
        linearLayout.setVisibility(GRANT);
        linearLayout.setClickable(true);
        return linearLayout;
    }

    void settings() {
        WebSettings settings = this.webview.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(1);
        settings.setSupportMultipleWindows(false);
        settings.setGeolocationEnabled(false);
        settings.setSaveFormData(false);
        settings.setCacheMode(LIGHT);
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(this.webview, false);
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & 2) != 0);
    }

    @Override // android.app.Activity
    protected void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        if (Build.VERSION.SDK_INT >= 28) {
            try {
                android.view.WindowManager.LayoutParams lp = getWindow().getAttributes();
                java.lang.reflect.Field field = lp.getClass().getField("layoutInDisplayCutoutMode");
                field.setInt(lp, 1);
                getWindow().setAttributes(lp);
            } catch (Exception ignored) {
            }
        }
        this.dark = initialdark();
        this.root = new FrameLayout(this);
        this.root.setFitsSystemWindows(false);
        this.bridge = new Bridge(this);
        makeview();
        this.limit = new Task(this, 5);
        this.splash = makesplash();
        this.problem = makeproblem();
        ViewGroup.LayoutParams layoutParams = new ViewGroup.LayoutParams(LIGHT, LIGHT);
        this.root.addView(this.webview, layoutParams);
        this.root.addView(this.problem, layoutParams);
        this.root.addView(this.splash, layoutParams);
        setContentView(this.root);
        style(this.dark);
        askstorage();
        stale();
        this.state = bundle;
        new Thread(new Worker(this)).start();
        begin();
        cover();
    }

    WebView makeview() {
        WebView webView = new WebView(this);
        this.webview = webView;
        settings();
        webView.addJavascriptInterface(this.bridge, "SFNative");
        webView.setWebViewClient(new Client(this));
        webView.setWebChromeClient(new Chrome(this));
        webView.setDownloadListener(new Loader(this));
        webView.setBackgroundColor(this.dark ? NIGHT : LIGHT);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        return webView;
    }

    @Override // android.app.Activity
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && this.root != null && this.webview != null) {
            style(this.dark);
        }
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        if (getSharedPreferences("superflex_prefs", MODE_PRIVATE).contains("theme_dark")) {
            return;
        }
        boolean isDark = systemdark();
        if (this.dark != isDark) {
            this.dark = isDark;
            style(this.dark);
            if (this.webview != null) {
                this.webview.post(new Runnable() {
                    @Override
                    public void run() {
                        String script = "if (window.__sfsynctheme) window.__sfsynctheme(" + MainActivity.this.dark + ");";
                        MainActivity.this.webview.evaluateJavascript(script, null);
                    }
                });
            }
        }
    }

    void cover() {
        if (this.splash != null) {
            boolean fresh = this.coverAt == 0L || this.splash.getVisibility() != View.VISIBLE || this.hiding;
            this.hiding = false;
            this.revealing = false;
            this.shown = true;
            if (fresh) {
                this.coverAt = SystemClock.elapsedRealtime();
            }
            style(this.dark);
            this.splash.removeCallbacks(this.splashHide);
            this.splash.removeCallbacks(this.splashReveal);
            this.splash.removeCallbacks(this.limit);
            if (fresh) {
                this.splash.evaluateJavascript(
                    "if (window.setTheme) window.setTheme(" + this.dark + "); if (window.resetSplash) window.resetSplash();",
                    null
                );
                this.splash.setVisibility(View.VISIBLE);
            }
            this.splash.postDelayed(this.limit, SPLASH_LIMIT_MS);
        }
    }

    void revive(WebView webView) {
        String url;
        if (webView == this.webview) {
            try {
                url = webView.getUrl();
                if (url == null || !Client.portal(Uri.parse(url))) {
                    url = HOME;
                }
            } catch (Exception e) {
                url = HOME;
            }
            this.crashes++;
            this.root.removeView(webView);
            webView.destroy();
            WebView webViewMakeview = makeview();
            this.root.addView(webViewMakeview, 0, new ViewGroup.LayoutParams(LIGHT, LIGHT));
            if (this.crashes > 3) {
                offline();
            } else {
                cover();
                webViewMakeview.loadUrl(url);
            }
        }
    }

    void stale() {
        String strValueOf;
        File filesDir = getFilesDir();
        File file = new File(filesDir, "shell.txt");
        try {
            strValueOf = String.valueOf(getPackageManager().getPackageInfo(getPackageName(), 0).lastUpdateTime);
        } catch (Exception e) {
            strValueOf = "x";
        }
        if (!strValueOf.equals(Updater.load(file))) {
            Updater.remove(new File(filesDir, "web"));
            Updater.remove(new File(filesDir, "web.new"));
            try {
                FileOutputStream fileOutputStream = new FileOutputStream(file);
                fileOutputStream.write(strValueOf.getBytes("UTF-8"));
                fileOutputStream.close();
            } catch (Exception e2) {
            }
        }
    }

    void begin() {
        boolean z = true;
        if (!this.started && !this.gone) {
            this.started = true;
            Updater.apply(getFilesDir());
            this.early = readasset("web/early.js");
            this.main = readasset("web/main.js");
            if (this.state == null || this.webview.restoreState(this.state) == null) {
                z = false;
            }
            this.state = null;
            if (!z) {
                this.webview.loadUrl(HOME);
            }
        }
    }

    void askstorage() {
        if (Build.VERSION.SDK_INT < 29 && checkSelfPermission("android.permission.WRITE_EXTERNAL_STORAGE") != 0) {
            requestPermissions(new String[]{"android.permission.WRITE_EXTERNAL_STORAGE"}, GRANT);
        }
    }

    void perform(int i) {
        if (i == 1) {
            if (!this.failed && this.splash != null && this.splash.getVisibility() == View.VISIBLE && !this.hiding && !this.revealing) {
                this.revealing = true;
                long elapsed = SystemClock.elapsedRealtime() - this.coverAt;
                long waitMs = Math.max(SPLASH_SETTLE_MS, SPLASH_MIN_MS - elapsed);
                this.splash.removeCallbacks(this.splashReveal);
                this.splash.postDelayed(this.splashReveal, waitMs);
            }
            return;
        }
        if (i == 5) {
            if (!this.failed && this.splash != null && this.splash.getVisibility() == View.VISIBLE && !this.hiding) {
                this.hiding = true;
                this.revealing = false;
                this.shown = false;
                this.splash.removeCallbacks(this.splashReveal);
                this.splash.removeCallbacks(this.limit);
                this.splash.removeCallbacks(this.splashHide);
                if (this.webview != null) {
                    this.webview.evaluateJavascript(
                        "if (document.body) { document.body.classList.add('!visible'); document.body.style.setProperty('visibility', 'visible', 'important'); }",
                        null
                    );
                }
                this.splash.evaluateJavascript("if (window.fadeOutSplash) window.fadeOutSplash();", null);
                this.splash.postDelayed(this.splashHide, SPLASH_FADE_MS);
            }
            return;
        }
        if (i == 2) {
            style(this.dark);
        }
        if (i == 3) {
            begin();
        }
        if (i == 4) {
            cover();
        }
    }

    void offline() {
        this.failed = true;
        this.hiding = false;
        this.revealing = false;
        this.webview.stopLoading();
        if (this.splash != null) {
            this.splash.removeCallbacks(this.splashReveal);
            this.splash.removeCallbacks(this.limit);
            this.splash.removeCallbacks(this.splashHide);
            this.splash.setVisibility(View.GONE);
        }
        this.problem.setVisibility(0);
    }

    @Override // android.view.View.OnClickListener
    public void onClick(View view) {
        this.problem.setVisibility(GRANT);
        cover();
        this.failed = false;
        String url = this.webview.getUrl();
        if (url == null || url.startsWith("data:")) {
            this.webview.loadUrl(HOME);
        } else {
            this.webview.reload();
        }
    }

    boolean pick(ValueCallback<Uri[]> valueCallback, WebChromeClient.FileChooserParams fileChooserParams) {
        if (this.chooser != null) {
            this.chooser.onReceiveValue(null);
        }
        this.chooser = valueCallback;
        try {
            startActivityForResult(fileChooserParams.createIntent(), PICK);
            return true;
        } catch (Exception e) {
            this.chooser = null;
            return false;
        }
    }

    @Override // android.app.Activity
    protected void onActivityResult(int i, int i2, Intent intent) {
        if (i != PICK) {
            super.onActivityResult(i, i2, intent);
        } else if (this.chooser != null) {
            this.chooser.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(i2, intent));
            this.chooser = null;
        }
    }

    void save(String str, String str2, String str3, String str4) {
        perform(1);
        Uri uri = Uri.parse(str);
        if (!Client.portal(uri)) {
            Toast.makeText(this, R.string.blocked, 1).show();
            return;
        }
        try {
            DownloadManager downloadManager = (DownloadManager) getSystemService("download");
            DownloadManager.Request request = new DownloadManager.Request(uri);
            String cookie = CookieManager.getInstance().getCookie(str);
            if (cookie != null) {
                request.addRequestHeader("Cookie", cookie);
            }
            request.addRequestHeader("User-Agent", str2);
            request.addRequestHeader("Referer", HOME);
            String strGuessFileName = URLUtil.guessFileName(str, str3, str4);
            if (str4 != null && str4.length() > 0) {
                request.setMimeType(str4);
            }
            request.setTitle(strGuessFileName);
            request.setNotificationVisibility(1);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, strGuessFileName);
            downloadManager.enqueue(request);
            Toast.makeText(this, R.string.saving, 0).show();
        } catch (Exception e) {
            Toast.makeText(this, R.string.blocked, 1).show();
        }
    }

    @Override // android.app.Activity
    public void onBackPressed() {
        if (this.problem.getVisibility() == 0) {
            super.onBackPressed();
        } else if (this.webview.canGoBack()) {
            this.webview.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override // android.app.Activity
    protected void onSaveInstanceState(Bundle bundle) {
        super.onSaveInstanceState(bundle);
        this.webview.saveState(bundle);
    }

    @Override // android.app.Activity
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
        if (this.splash != null) {
            this.splash.onPause();
        }
        this.webview.onPause();
    }

    @Override // android.app.Activity
    protected void onResume() {
        super.onResume();
        if (this.splash != null) {
            this.splash.onResume();
        }
        this.webview.onResume();
    }

    @Override // android.app.Activity
    protected void onDestroy() {
        this.gone = true;
        if (this.chooser != null) {
            this.chooser.onReceiveValue(null);
        }
        if (this.splash != null) {
            this.splash.removeCallbacks(this.splashHide);
            this.splash.removeCallbacks(this.limit);
            this.root.removeView(this.splash);
            this.splash.destroy();
            this.splash = null;
        }
        this.root.removeView(this.webview);
        this.webview.removeJavascriptInterface("SFNative");
        this.webview.destroy();
        super.onDestroy();
    }
}
