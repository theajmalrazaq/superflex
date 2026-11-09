package com.superflex.app;

import android.webkit.JavascriptInterface;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;

public class Bridge {
    private static final int LIMIT = 2 * 1024 * 1024;
    final MainActivity owner;
    boolean trusted = false;

    public Bridge(MainActivity owner) {
        this.owner = owner;
    }

    private static boolean campus(String host) {
        if (host == null) return false;
        return host.equals("nu.edu.pk") || host.endsWith(".nu.edu.pk");
    }

    private static String readtext(InputStream is) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int len;
        while ((len = is.read(buf)) != -1) {
            baos.write(buf, 0, len);
            if (baos.size() > LIMIT) throw new Exception("too large");
        }
        return baos.toString("UTF-8");
    }

    @JavascriptInterface
    public String fetchText(String targetUrl) {
        if (!trusted) return "{\"status\":0}";
        try {
            URL url = new URL(targetUrl);
            if (!"https".equals(url.getProtocol()) || !campus(url.getHost())) {
                return "{\"status\":0}";
            }
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            conn.setInstanceFollowRedirects(true);
            conn.setRequestProperty("User-Agent", "SuperFlex-Android");
            int code = conn.getResponseCode();
            InputStream is = (code >= 200 && code < 400) ? conn.getInputStream() : conn.getErrorStream();
            String body = is != null ? readtext(is) : "";
            JSONObject json = new JSONObject();
            json.put("status", code);
            json.put("body", body);
            return json.toString();
        } catch (Exception e) {
            return "{\"status\":0}";
        }
    }

    @JavascriptInterface
    public void ready() {
        owner.runOnUiThread(new Task(owner, 1));
    }

    @JavascriptInterface
    public void theme(boolean dark) {
        owner.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                owner.style(dark);
            }
        });
    }
}
