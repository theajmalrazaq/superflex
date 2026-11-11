package com.superflex.app;

import android.animation.Keyframe;
import android.animation.ObjectAnimator;
import android.animation.PropertyValuesHolder;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.LinearInterpolator;
import android.view.animation.PathInterpolator;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;

/* JADX INFO: loaded from: /tmp/claude_apk/classes.dex */
public class MainActivity extends Activity implements View.OnClickListener {
    static final int GRANT = 8;
    static final String HOME = "https://flexstudent.nu.edu.pk/Login";
    static final String HOST = "flexstudent.nu.edu.pk";
    static final int LIGHT = -1;
    static final int NIGHT = Color.parseColor("#0B0B0F");
    static final int PICK = 7;
    Bridge bridge;
    ValueCallback<Uri[]> chooser;
    Task limit;
    LinearLayout problem;
    Button retry;
    FrameLayout root;
    FrameLayout splash;
    ImageView splashCloudLeft;
    ImageView splashCloudRight;
    FrameLayout splashCard;
    ImageView splashBolt;
    ObjectAnimator splashAnim;
    Bundle state;
    WebView webview;
    String early = "";
    String main = "";
    volatile boolean dark = false;
    boolean failed = false;
    boolean shown = true;
    boolean started = false;
    int crashes = 0;
    boolean gone = false;

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

    boolean systemdark() {
        return (getResources().getConfiguration().uiMode & 48) == 32;
    }

    int px(int i) {
        return (int) (i * getResources().getDisplayMetrics().density);
    }

    GradientDrawable splashBackground(boolean night) {
        int[] colors = night ? new int[] {
            Color.parseColor("#0F1422"),
            Color.parseColor("#0F1422"),
            Color.parseColor("#0B0E17"),
            Color.parseColor("#06070C"),
            Color.parseColor("#000000")
        } : new int[] {
            Color.parseColor("#62ABE0"),
            Color.parseColor("#73B3E1"),
            Color.parseColor("#9AC7E8"),
            Color.parseColor("#DCEBF5"),
            Color.parseColor("#FFFFFF")
        };
        return new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, colors);
    }

    void updateSplashTheme(boolean night) {
        if (this.splash != null) {
            this.splash.setBackground(splashBackground(night));
        }
        if (this.splashCloudLeft != null) {
            this.splashCloudLeft.setAlpha(night ? 0.26f : 0.80f);
        }
        if (this.splashCloudRight != null) {
            this.splashCloudRight.setAlpha(night ? 0.34f : 0.75f);
        }
        if (this.splashCard != null) {
            GradientDrawable cardBg = new GradientDrawable();
            cardBg.setCornerRadius(px(28));
            cardBg.setColor(night ? 0x66000000 : 0x99FFFFFF);
            cardBg.setStroke(px(1), night ? 0x1AFFFFFF : 0x66FFFFFF);
            this.splashCard.setBackground(cardBg);
        }
        if (this.splashBolt != null) {
            this.splashBolt.setColorFilter(night ? Color.WHITE : Color.parseColor("#230052"));
        }
    }

    void style(boolean z) {
        int i = z ? NIGHT : LIGHT;
        getWindow().setStatusBarColor(i);
        getWindow().setNavigationBarColor(i);
        int i2 = 0;
        if (!z) {
            i2 = 8192;
            if (Build.VERSION.SDK_INT >= 26) {
                i2 = 8208;
            }
        }
        getWindow().getDecorView().setSystemUiVisibility(i2);
        this.root.setBackgroundColor(i);
        this.webview.setBackgroundColor(i);
        updateSplashTheme(z);
    }

    FrameLayout makesplash() {
        FrameLayout frameLayout = new FrameLayout(this);
        frameLayout.setBackground(splashBackground(this.dark));
        frameLayout.setClipChildren(false);

        splashCloudLeft = new ImageView(this);
        splashCloudLeft.setImageResource(R.drawable.cloud);
        splashCloudLeft.setScaleType(ImageView.ScaleType.FIT_XY);
        splashCloudLeft.setAlpha(this.dark ? 0.26f : 0.80f);
        FrameLayout.LayoutParams leftParams = new FrameLayout.LayoutParams(px(320), px(160), Gravity.TOP | Gravity.START);
        leftParams.leftMargin = -px(48);
        leftParams.topMargin = px(40);
        frameLayout.addView(splashCloudLeft, leftParams);

        splashCloudRight = new ImageView(this);
        splashCloudRight.setImageResource(R.drawable.cloud);
        splashCloudRight.setScaleType(ImageView.ScaleType.FIT_XY);
        splashCloudRight.setAlpha(this.dark ? 0.34f : 0.75f);
        FrameLayout.LayoutParams rightParams = new FrameLayout.LayoutParams(px(350), px(175), Gravity.BOTTOM | Gravity.END);
        rightParams.rightMargin = -px(64);
        rightParams.bottomMargin = px(64);
        frameLayout.addView(splashCloudRight, rightParams);

        splashCard = new FrameLayout(this);
        GradientDrawable cardBg = new GradientDrawable();
        cardBg.setCornerRadius(px(28));
        cardBg.setColor(this.dark ? 0x66000000 : 0x99FFFFFF);
        cardBg.setStroke(px(1), this.dark ? 0x1AFFFFFF : 0x66FFFFFF);
        splashCard.setBackground(cardBg);

        splashBolt = new ImageView(this);
        splashBolt.setImageResource(R.drawable.ic_bolt);
        splashBolt.setColorFilter(this.dark ? Color.WHITE : Color.parseColor("#230052"));
        FrameLayout.LayoutParams boltParams = new FrameLayout.LayoutParams(px(56), px(56), Gravity.CENTER);
        splashCard.addView(splashBolt, boltParams);

        startSplashAnim();

        FrameLayout.LayoutParams cardParams = new FrameLayout.LayoutParams(px(96), px(96), Gravity.CENTER);
        frameLayout.addView(splashCard, cardParams);

        frameLayout.setClickable(true);
        return frameLayout;
    }

    void startSplashAnim() {
        if (splashBolt == null) return;
        splashBolt.setPivotX(px(28));
        splashBolt.setPivotY(px(28));
        splashBolt.setScaleX(0.65f);
        splashBolt.setScaleY(0.65f);
        splashBolt.setAlpha(0.9f);

        PathInterpolator ease = new PathInterpolator(0.4f, 0.0f, 0.2f, 1.0f);

        Keyframe kfScale0 = Keyframe.ofFloat(0.0f, 0.65f);
        Keyframe kfScale1 = Keyframe.ofFloat(0.5f, 1.05f);
        kfScale1.setInterpolator(ease);
        Keyframe kfScale2 = Keyframe.ofFloat(1.0f, 0.65f);
        kfScale2.setInterpolator(ease);

        PropertyValuesHolder pvhScaleX = PropertyValuesHolder.ofKeyframe(View.SCALE_X, kfScale0, kfScale1, kfScale2);
        PropertyValuesHolder pvhScaleY = PropertyValuesHolder.ofKeyframe(View.SCALE_Y, kfScale0, kfScale1, kfScale2);

        Keyframe kfAlpha0 = Keyframe.ofFloat(0.0f, 0.9f);
        Keyframe kfAlpha1 = Keyframe.ofFloat(0.5f, 1.0f);
        kfAlpha1.setInterpolator(ease);
        Keyframe kfAlpha2 = Keyframe.ofFloat(1.0f, 0.9f);
        kfAlpha2.setInterpolator(ease);

        PropertyValuesHolder pvhAlpha = PropertyValuesHolder.ofKeyframe(View.ALPHA, kfAlpha0, kfAlpha1, kfAlpha2);

        if (splashAnim != null) {
            splashAnim.cancel();
        }
        splashAnim = ObjectAnimator.ofPropertyValuesHolder(splashBolt, pvhScaleX, pvhScaleY, pvhAlpha);
        splashAnim.setDuration(2200);
        splashAnim.setInterpolator(new LinearInterpolator());
        splashAnim.setRepeatCount(ValueAnimator.INFINITE);
        splashAnim.setRepeatMode(ValueAnimator.RESTART);
        splashAnim.start();
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
        this.dark = systemdark();
        this.root = new FrameLayout(this);
        this.root.setFitsSystemWindows(true);
        this.bridge = new Bridge(this);
        makeview();
        this.limit = new Task(this, 1);
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
        if (bundle != null) {
            begin();
        } else {
            this.splash.postDelayed(new Task(this, 3), 4000L);
        }
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
        return webView;
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
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
            this.dark = systemdark();
            style(this.dark);
            updateSplashTheme(this.dark);
            this.splash.animate().cancel();
            this.splash.setAlpha(1.0f);
            this.splash.setScaleX(1.0f);
            this.splash.setScaleY(1.0f);
            this.splash.setVisibility(View.VISIBLE);
            this.splash.removeCallbacks(this.limit);
            this.splash.postDelayed(this.limit, 9000L);
            if (splashAnim == null || !splashAnim.isRunning()) {
                startSplashAnim();
            }
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
            if (!this.failed && this.splash != null && this.splash.getVisibility() == View.VISIBLE) {
                this.splash.animate()
                    .alpha(0.0f)
                    .scaleX(1.03f)
                    .scaleY(1.03f)
                    .setDuration(300)
                    .withEndAction(new Runnable() {
                        @Override
                        public void run() {
                            MainActivity.this.splash.setVisibility(View.GONE);
                            MainActivity.this.splash.setAlpha(1.0f);
                            MainActivity.this.splash.setScaleX(1.0f);
                            MainActivity.this.splash.setScaleY(1.0f);
                        }
                    })
                    .start();
                this.shown = false;
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
        this.webview.stopLoading();
        this.splash.setVisibility(GRANT);
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
        this.webview.onPause();
    }

    @Override // android.app.Activity
    protected void onResume() {
        super.onResume();
        this.webview.onResume();
    }

    @Override // android.app.Activity
    protected void onDestroy() {
        this.gone = true;
        if (this.chooser != null) {
            this.chooser.onReceiveValue(null);
        }
        this.root.removeView(this.webview);
        this.webview.removeJavascriptInterface("SFNative");
        this.webview.destroy();
        super.onDestroy();
    }
}
