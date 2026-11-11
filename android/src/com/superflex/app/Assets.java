package com.superflex.app;

import android.content.res.AssetManager;
import java.io.InputStream;

/* JADX INFO: loaded from: /tmp/claude_apk/classes.dex */
public class Assets implements Seed {
    AssetManager manager;

    Assets(AssetManager assetManager) {
        this.manager = assetManager;
    }

    @Override // com.superflex.app.Seed
    public InputStream open(String str) throws Exception {
        return this.manager.open(str);
    }
}
