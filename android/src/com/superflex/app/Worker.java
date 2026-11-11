package com.superflex.app;

/* JADX INFO: loaded from: /tmp/claude_apk/classes.dex */
public class Worker implements Runnable {
    MainActivity owner;

    Worker(MainActivity mainActivity) {
        this.owner = mainActivity;
    }

    @Override // java.lang.Runnable
    public void run() {
        try {
            new Updater(this.owner.getFilesDir(), this.owner.getString(R.string.bundle), new Assets(this.owner.getAssets())).check();
        } catch (Exception e) {
        }
        this.owner.runOnUiThread(new Task(this.owner, 3));
    }
}
