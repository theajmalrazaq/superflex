package com.superflex.app;

import android.net.Uri;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

public class Chrome extends WebChromeClient {
    MainActivity owner;

    Chrome(MainActivity owner) {
        this.owner = owner;
    }

    @Override
    public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
        return owner.pick(callback, params);
    }
}
