package com.superflex.app;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import org.json.JSONArray;
import org.json.JSONObject;

/* JADX INFO: loaded from: /tmp/claude_apk/classes.dex */
public class Updater {
    static final int COUNT = 64;
    static final int LIMIT = 8000000;
    static final int SHELL = 1;
    String base;
    File home;
    String host;
    Seed seed;

    Updater(File file, String str, Seed seed) throws Exception {
        URL url = new URL(str);
        if (!url.getProtocol().equals("https")) {
            throw new Exception("scheme");
        }
        if (!str.endsWith("/")) {
            throw new Exception("base");
        }
        this.home = file;
        this.base = str;
        this.host = url.getHost();
        this.seed = seed;
    }

    static void remove(File file) {
        File[] fileArrListFiles = file.listFiles();
        if (fileArrListFiles != null) {
            int length = fileArrListFiles.length;
            for (int i = 0; i < length; i += SHELL) {
                remove(fileArrListFiles[i]);
            }
        }
        file.delete();
    }

    static byte[] slurp(InputStream inputStream) throws Exception {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        byte[] bArr = new byte[16384];
        int i = inputStream.read(bArr);
        while (i != -1) {
            byteArrayOutputStream.write(bArr, 0, i);
            if (byteArrayOutputStream.size() > LIMIT) {
                throw new Exception("size");
            }
            i = inputStream.read(bArr);
        }
        return byteArrayOutputStream.toByteArray();
    }

    static String digest(byte[] bArr) throws Exception {
        byte[] bArrDigest = MessageDigest.getInstance("SHA-256").digest(bArr);
        StringBuilder sb = new StringBuilder();
        int length = bArrDigest.length;
        for (int i = 0; i < length; i += SHELL) {
            sb.append(String.format("%02x", Byte.valueOf(bArrDigest[i])));
        }
        return sb.toString();
    }

    static boolean safe(String str) {
        return (str.length() == 0 || str.length() > 200 || str.contains("..") || !str.matches("[A-Za-z0-9_.-]+(/[A-Za-z0-9_.-]+)*") || str.equals("version.txt")) ? false : true;
    }

    static boolean inside(File file, File file2) throws Exception {
        return file2.getCanonicalPath().startsWith(file.getCanonicalPath() + File.separator);
    }

    static File resolve(File file, String str) {
        try {
            File file2 = new File(file, "web");
            File file3 = new File(file2, str);
            if (inside(file2, file3) && file3.isFile()) {
                return file3;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    static String load(File file) {
        try {
            if (!file.isFile()) {
                return "";
            }
            FileInputStream fileInputStream = new FileInputStream(file);
            try {
                return new String(slurp(fileInputStream), "UTF-8");
            } finally {
                fileInputStream.close();
            }
        } catch (Exception e) {
            return "";
        }
    }

    static boolean apply(File file) {
        File file2 = new File(file, "web.new");
        if (!new File(file2, "version.txt").isFile()) {
            return false;
        }
        File file3 = new File(file, "web");
        remove(file3);
        if (file2.renameTo(file3)) {
            return true;
        }
        remove(file2);
        return false;
    }

    byte[] fetch(String str) throws Exception {
        HttpURLConnection httpURLConnection = (HttpURLConnection) new URL(this.base + str).openConnection();
        try {
            httpURLConnection.setConnectTimeout(8000);
            httpURLConnection.setReadTimeout(15000);
            httpURLConnection.setUseCaches(false);
            if (httpURLConnection.getResponseCode() != 200) {
                throw new Exception("status");
            }
            if (!this.host.equals(httpURLConnection.getURL().getHost())) {
                throw new Exception("host");
            }
            if (!httpURLConnection.getURL().getProtocol().equals("https")) {
                throw new Exception("scheme");
            }
            InputStream inputStream = httpURLConnection.getInputStream();
            try {
                byte[] bArrSlurp = slurp(inputStream);
                inputStream.close();
                httpURLConnection.disconnect();
                return bArrSlurp;
            } catch (Throwable th) {
                inputStream.close();
                throw th;
            }
        } catch (Throwable th2) {
            httpURLConnection.disconnect();
            throw th2;
        }
    }

    byte[] local(String str) throws Exception {
        InputStream inputStreamOpen;
        try {
            File fileResolve = resolve(this.home, str);
            if (fileResolve != null) {
                inputStreamOpen = new FileInputStream(fileResolve);
            } else {
                inputStreamOpen = this.seed.open("web/" + str);
            }
            if (inputStreamOpen == null) {
                return null;
            }
            try {
                return slurp(inputStreamOpen);
            } finally {
                inputStreamOpen.close();
            }
        } catch (Exception e) {
            return null;
        }
    }

    void write(File file, String str, byte[] bArr) throws Exception {
        File file2 = new File(file, str);
        if (!inside(file, file2)) {
            throw new Exception("path");
        }
        file2.getParentFile().mkdirs();
        FileOutputStream fileOutputStream = new FileOutputStream(file2);
        try {
            fileOutputStream.write(bArr);
        } finally {
            fileOutputStream.close();
        }
    }

    boolean check() throws Exception {
        JSONObject jSONObject = new JSONObject(new String(fetch("manifest.json?t=" + String.valueOf(System.currentTimeMillis())), "UTF-8"));
        String string = jSONObject.getString("version");
        if (!string.matches("[A-Za-z0-9._-]{1,64}")) {
            throw new Exception("version");
        }
        if (jSONObject.getInt("shell") <= SHELL && !string.equals(load(new File(this.home, "web/version.txt"))) && !string.equals(load(new File(this.home, "web.new/version.txt")))) {
            JSONArray jSONArray = jSONObject.getJSONArray("files");
            if (jSONArray.length() == 0 || jSONArray.length() > COUNT) {
                throw new Exception("count");
            }
            File file = new File(this.home, "web.new");
            remove(file);
            file.mkdirs();
            int i = 0;
            boolean z = false;
            boolean z2 = false;
            while (i < jSONArray.length()) {
                try {
                    JSONObject jSONObject2 = jSONArray.getJSONObject(i);
                    String string2 = jSONObject2.getString("path");
                    String string3 = jSONObject2.getString("sha256");
                    if (!safe(string2)) {
                        throw new Exception("path");
                    }
                    byte[] bArrLocal = local(string2);
                    if (bArrLocal == null || !digest(bArrLocal).equals(string3)) {
                        bArrLocal = fetch("web/" + string2 + "?v=" + string);
                        if (!digest(bArrLocal).equals(string3)) {
                            throw new Exception("hash");
                        }
                    }
                    write(file, string2, bArrLocal);
                    boolean z3 = string2.equals("superflex.js") ? true : z2;
                    if (string2.equals("content.css")) {
                        z = true;
                    }
                    i += SHELL;
                    z2 = z3;
                } catch (Exception e) {
                    remove(file);
                    throw e;
                }
            }
            if (!z2 || !z) {
                throw new Exception("incomplete");
            }
            write(file, "version.txt", string.getBytes("UTF-8"));
            return true;
        }
        return false;
    }
}
