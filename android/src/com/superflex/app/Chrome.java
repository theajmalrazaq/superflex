package com.superflex.app;

import android.net.Uri;
import android.util.Log;
import android.webkit.ConsoleMessage;
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

    @Override
    public boolean onConsoleMessage(ConsoleMessage cm) {
        Log.d("SuperFlexJS", cm.message() + " [" + cm.sourceId() + ":" + cm.lineNumber() + "]");
        return true;
    }
}
