import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

web = Path(__file__).resolve().parent.parent / "assets" / "web"
early = (web / "early.js").read_text()
main = (web / "main.js").read_text()
types = {".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp"}

page_html = """<!DOCTYPE html><html><head><title>FLEX</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body><div class="m-grid m-grid--hor"><div class="m-login__wrapper"><form id="f" method="post" action="/Login/Index">
<input name="Username" id="u" type="text" placeholder="Student ID"><input name="Password" id="p" type="password"><button type="submit">Login</button>
</form></div></div></body></html>"""

calls = []
logs = []


def handler(route):
    url = route.request.url
    if "/__superflex__/" in url:
        name = url.split("/__superflex__/")[1].split("?")[0]
        target = web / name
        if target.is_file():
            route.fulfill(status=200, body=target.read_bytes(), content_type=types.get(target.suffix, "application/octet-stream"))
            return
        route.fulfill(status=404, body="missing")
        return
    if url.startswith("https://flexstudent.nu.edu.pk/"):
        route.fulfill(status=200, body=page_html, content_type="text/html")
        return
    route.abort()


def record(message):
    logs.append(message.type + ": " + message.text)


def inject(page):
    page.evaluate(early)
    page.evaluate(main)


def check(name, ok, extra=""):
    print(("PASS" if ok else "FAIL") + "  " + name + ("  " + extra if extra else ""))
    return ok


def run():
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        context = browser.new_context(viewport={"width": 390, "height": 800}, is_mobile=True, has_touch=True)
        context.route("**/*", handler)
        page = context.new_page()
        page.on("console", record)
        page.on("pageerror", lambda error: logs.append("pageerror: " + str(error)))
        page.add_init_script("window.SFNative={ready:function(){window.__ready=(window.__ready||0)+1},theme:function(v){window.__theme=v},fetchText:function(){return JSON.stringify({status:0})}}")
        page.on("load", inject)
        page.goto("https://flexstudent.nu.edu.pk/Login")
        page.wait_for_timeout(2500)
        for attempt in range(3):
            if page.evaluate("document.querySelectorAll('#react-chrome-app').length") == 1 and page.evaluate("!!window.__superflex"):
                break
            page.wait_for_timeout(1500)
        results.append(check("shim installed once", page.evaluate("!!window.__superflex")))
        results.append(check("single React root", page.evaluate("document.querySelectorAll('#react-chrome-app').length") == 1))
        results.append(check("SuperFlex login UI present", page.evaluate("!!document.getElementById('login-clouds') && !!document.getElementById('terms-modal')")))
        results.append(check("login class applied", page.evaluate("document.body.classList.contains('superflex-login-page')")))
        results.append(check("body revealed", page.evaluate("document.body.classList.contains('!visible')")))
        results.append(check("native ready called", (page.evaluate("window.__ready||0") or 0) >= 1))
        results.append(check("native theme called", page.evaluate("typeof window.__theme") == "boolean"))
        results.append(check("css loaded", page.evaluate("!!document.getElementById('sf-css')")))
        results.append(check("getURL maps to virtual path", page.evaluate("chrome.runtime.getURL('assets/favicon.svg')") == "https://flexstudent.nu.edu.pk/__superflex__/assets/favicon.svg"))
        results.append(check("manifest version", page.evaluate("chrome.runtime.getManifest().version") == json.load(open(Path(__file__).resolve().parents[2] / "package.json"))["version"]))
        status = page.evaluate("fetch('/__superflex__/reviews.json').then(function(r){return r.status})")
        results.append(check("asset served", status == 200))

        page.evaluate("new Promise(function(done){chrome.storage.local.set({probe:{a:1}},function(){done(true)})})")
        page.reload()
        page.wait_for_timeout(2500)
        stored = page.evaluate("new Promise(function(done){chrome.storage.local.get('probe',function(r){done(r)})})")
        results.append(check("storage persists across reload", stored == {"probe": {"a": 1}}, str(stored)))
        results.append(check("still one root after reload", page.evaluate("document.querySelectorAll('#react-chrome-app').length") == 1))

        inject(page)
        page.wait_for_timeout(500)
        results.append(check("re-injection does not duplicate root", page.evaluate("document.querySelectorAll('#react-chrome-app').length") == 1))

        reply = page.evaluate("new Promise(function(done){chrome.runtime.sendMessage({type:'SUPERFLEX_AI_PERMISSION_GET'},function(r){done({r:r,e:chrome.runtime.lastError&&chrome.runtime.lastError.message})})})")
        results.append(check("background message roundtrip", isinstance(reply, dict) and reply.get("r") is not None, str(reply)))
        bad = page.evaluate("new Promise(function(done){chrome.runtime.sendMessage({type:'nonsense'},function(r){done(r)})})")
        results.append(check("invalid message rejected by background", isinstance(bad, dict) and "error" in bad, str(bad)))
        denied = page.evaluate("""new Promise(function(done){
          var port=chrome.runtime.connect({name:'SUPERFLEX_AI_STREAM'});
          port.onMessage.addListener(function(m){done(m)});
          port.postMessage({type:'STREAM',prompt:'hi'});
          setTimeout(function(){done('timeout')},3000)})""")
        print("INFO  stream port reply:", str(denied)[:160])
        browser.close()
    errors = [line for line in logs if line.startswith("pageerror") or "Uncaught" in line]
    results.append(check("no uncaught page errors", len(errors) == 0, "; ".join(errors)[:300]))
    print("\nconsole lines:", len(logs))
    for line in logs[:12]:
        print("  ", line[:160])
    return all(results)


if __name__ == "__main__":
    sys.exit(0 if run() else 1)
