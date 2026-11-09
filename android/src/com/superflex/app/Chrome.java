package com.superflex.app;

import android.net.Uri;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

public class Chrome extends WebChromeClient {
    final MainActivity owner;

    public Chrome(MainActivity owner) {
        this.owner = owner;
    }

    @Override
    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
        return owner.pick(filePathCallback, fileChooserParams);
    }
}
