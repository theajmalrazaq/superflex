package com.superflex.app;

import android.webkit.DownloadListener;

public class Loader implements DownloadListener {
    MainActivity owner;

    Loader(MainActivity owner) {
        this.owner = owner;
    }

    public void onDownloadStart(String url, String agent, String disposition, String mime, long length) {
        owner.save(url, agent, disposition, mime);
    }
}
