package com.superflex.app;

import android.webkit.DownloadListener;

public class Loader implements DownloadListener {
    final MainActivity owner;

    public Loader(MainActivity owner) {
        this.owner = owner;
    }

    @Override
    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        owner.save(url, userAgent, contentDisposition, mimeType, contentLength);
    }
}
