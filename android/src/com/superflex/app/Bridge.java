package com.superflex.app;

import android.webkit.JavascriptInterface;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;

public class Bridge {
    static final int LIMIT = 3000000;
    MainActivity owner;
    volatile boolean trusted = false;

    Bridge(MainActivity owner) {
        this.owner = owner;
    }

    static boolean campus(String host) {
        if (host == null) return false;
        return host.endsWith(".nu.edu.pk") && !host.equals(MainActivity.HOST);
    }

    static String readtext(InputStream stream) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int count = stream.read(chunk);
        while (count != -1) {
            out.write(chunk, 0, count);
            if (out.size() > LIMIT) throw new Exception("too large");
            count = stream.read(chunk);
        }
        return out.toString("UTF-8");
    }

    @JavascriptInterface
    public boolean isSystemDark() {
        return owner.systemdark();
    }

    @JavascriptInterface
    public void ready() {
        if (!trusted) return;
        owner.runOnUiThread(new Task(owner, 1));
    }

    @JavascriptInterface
    public void theme(boolean dark) {
        if (!trusted) return;
        owner.dark = dark;
        owner.runOnUiThread(new Task(owner, 2));
    }

    @JavascriptInterface
    public String fetchText(String address) {
        HttpURLConnection link = null;
        try {
            if (!trusted) throw new Exception("untrusted");
            URL url = new URL(address);
            if (!url.getProtocol().equals("https")) throw new Exception("scheme");
            if (!campus(url.getHost())) throw new Exception("host");
            link = (HttpURLConnection) url.openConnection();
            link.setRequestMethod("GET");
            link.setConnectTimeout(12000);
            link.setReadTimeout(15000);
            link.setInstanceFollowRedirects(true);
            link.setRequestProperty("User-Agent", "SuperFlex-Android");
            int status = link.getResponseCode();
            if (!campus(link.getURL().getHost())) throw new Exception("redirect");
            InputStream stream = status >= 400 ? link.getErrorStream() : link.getInputStream();
            String body = stream == null ? "" : readtext(stream);
            JSONObject out = new JSONObject();
            out.put("status", status);
            out.put("url", link.getURL().toString());
            out.put("body", body);
            return out.toString();
        } catch (Exception error) {
            return "{\"status\":0}";
        } finally {
            if (link != null) link.disconnect();
        }
    }
}
