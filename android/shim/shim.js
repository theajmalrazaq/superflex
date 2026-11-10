var ident = "superflex-android";
var prefix = "__sf_cs:";
var origin = "https://flexstudent.nu.edu.pk";
var version = "__VERSION__";
var hub = { bgmessage: makeevent(), bgconnect: makeevent(), ctmessage: makeevent() };

function makeevent() {
  var list = [];
  function add(item) {
    list.push(item);
  }
  function remove(item) {
    var at = list.indexOf(item);
    if (at > -1) list.splice(at, 1);
  }
  function has(item) {
    return list.indexOf(item) > -1;
  }
  return { list: list, addListener: add, removeListener: remove, hasListener: has };
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function call(action, value) {
  action(value);
}

function callfail(runtime, action, text) {
  runtime.lastError = { message: text };
  try {
    action();
  } finally {
    runtime.lastError = undefined;
  }
}

function finish(action, value) {
  if (typeof action === "function") {
    setTimeout(call, 0, action, clone(value));
    return undefined;
  }
  return Promise.resolve(value);
}

function failure(runtime, action, text) {
  if (typeof action === "function") {
    setTimeout(callfail, 0, runtime, action, text);
    return undefined;
  }
  return Promise.reject(new Error(text));
}

function readall() {
  var out = {};
  var at = 0;
  var name = "";
  for (at = 0; at < localStorage.length; at++) {
    name = localStorage.key(at);
    if (name && name.indexOf(prefix) === 0) {
      try {
        out[name.slice(prefix.length)] = JSON.parse(localStorage.getItem(name));
      } catch (error) {
        out[name.slice(prefix.length)] = undefined;
      }
    }
  }
  return out;
}

function namesof(keys) {
  if (typeof keys === "string") return [keys];
  if (Array.isArray(keys)) return keys;
  return Object.keys(keys);
}

function makestorage(runtime) {
  function get(keys, action) {
    var all = readall();
    var out = {};
    var names = [];
    var at = 0;
    if (typeof keys === "function") {
      action = keys;
      keys = null;
    }
    if (keys === null || keys === undefined) {
      out = all;
    } else if (typeof keys === "object" && !Array.isArray(keys)) {
      names = Object.keys(keys);
      for (at = 0; at < names.length; at++) {
        out[names[at]] = names[at] in all ? all[names[at]] : keys[names[at]];
      }
    } else {
      names = namesof(keys);
      for (at = 0; at < names.length; at++) {
        if (names[at] in all) out[names[at]] = all[names[at]];
      }
    }
    return finish(action, out);
  }

  function set(items, action) {
    var names = Object.keys(items || {});
    var at = 0;
    try {
      for (at = 0; at < names.length; at++) {
        if (items[names[at]] === undefined) continue;
        localStorage.setItem(prefix + names[at], JSON.stringify(items[names[at]]));
      }
    } catch (error) {
      return failure(runtime, action, "Storage write failed.");
    }
    return finish(action, undefined);
  }

  function remove(keys, action) {
    var names = namesof(keys);
    var at = 0;
    for (at = 0; at < names.length; at++) {
      localStorage.removeItem(prefix + names[at]);
    }
    return finish(action, undefined);
  }

  function clear(action) {
    var names = Object.keys(readall());
    var at = 0;
    for (at = 0; at < names.length; at++) {
      localStorage.removeItem(prefix + names[at]);
    }
    return finish(action, undefined);
  }

  return { local: { get: get, set: set, remove: remove, clear: clear } };
}

function respond(state, value) {
  if (state.done) return;
  state.done = true;
  if (typeof state.action === "function") setTimeout(call, 0, state.action, clone(value));
}

function send(registry, message, sender, action, runtime) {
  var state = { done: false, action: action };
  var wait = false;
  var data = clone(message);
  var at = 0;
  var result;
  function reply(value) {
    respond(state, value);
  }
  for (at = 0; at < registry.list.length; at++) {
    try {
      result = registry.list[at](data, sender, reply);
    } catch (error) {
      result = undefined;
    }
    if (result === true) wait = true;
  }
  if (!wait && !state.done) {
    state.done = true;
    failure(runtime, action, "The message port closed before a response was received.");
  }
}

function arrive(peer, data) {
  var at = 0;
  if (!peer.open) return;
  for (at = 0; at < peer.onMessage.list.length; at++) {
    try {
      peer.onMessage.list[at](clone(data), peer);
    } catch (error) {
      console.error("SuperFlex port listener failed");
    }
  }
}

function notify(port) {
  var at = 0;
  for (at = 0; at < port.onDisconnect.list.length; at++) {
    try {
      port.onDisconnect.list[at](port);
    } catch (error) {
      console.error("SuperFlex disconnect listener failed");
    }
  }
}

function post(message) {
  if (!this.open || !this.peer) return;
  setTimeout(arrive, 0, this.peer, message === undefined ? null : clone(message));
}

function hangup() {
  var peer = this.peer;
  if (!this.open) return;
  this.open = false;
  if (peer && peer.open) {
    peer.open = false;
    setTimeout(notify, 0, peer);
  }
}

function makeport(name, sender) {
  return {
    name: name,
    sender: sender,
    open: true,
    peer: null,
    onMessage: makeevent(),
    onDisconnect: makeevent(),
    postMessage: post,
    disconnect: hangup,
  };
}

function offer(port) {
  var at = 0;
  for (at = 0; at < hub.bgconnect.list.length; at++) {
    try {
      hub.bgconnect.list[at](port);
    } catch (error) {
      console.error("SuperFlex connect listener failed");
    }
  }
}

function build(side) {
  var runtime = { id: ident, lastError: undefined };
  var mine = side === "bg";
  runtime.onMessage = mine ? hub.bgmessage : hub.ctmessage;
  runtime.onConnect = mine ? hub.bgconnect : makeevent();

  function getURL(path) {
    return origin + "/__superflex__/" + String(path || "").replace(/^\/+/, "");
  }

  function getManifest() {
    return { name: "SuperFlex", version: version, manifest_version: 3 };
  }

  function sendMessage(message, action) {
    var registry = mine ? hub.ctmessage : hub.bgmessage;
    var sender = { id: ident, url: location.href, origin: location.origin };
    if (typeof action !== "function") action = undefined;
    send(registry, message, sender, action, runtime);
    if (!action) return Promise.resolve(undefined);
    return undefined;
  }

  function connect(info) {
    var name = info && info.name ? String(info.name) : "";
    var near = makeport(name, undefined);
    var far = makeport(name, { id: ident, url: location.href, origin: location.origin });
    near.peer = far;
    far.peer = near;
    setTimeout(offer, 0, far);
    return near;
  }

  function query(info, action) {
    return finish(action, [{ id: 1, url: location.href, active: true }]);
  }

  function tabmessage(id, message, action) {
    var sender = { id: ident };
    if (typeof action !== "function") action = undefined;
    send(hub.ctmessage, message, sender, action, runtime);
    return undefined;
  }

  function wipe(options, types, action) {
    if (typeof types === "function") action = types;
    return finish(action, undefined);
  }

  runtime.getURL = getURL;
  runtime.getManifest = getManifest;
  runtime.sendMessage = sendMessage;
  runtime.connect = connect;

  return {
    runtime: runtime,
    storage: makestorage(runtime),
    tabs: { query: query, sendMessage: tabmessage },
    browsingData: { remove: wipe },
  };
}

function campushost(address) {
  var host = "";
  try {
    host = new URL(address).hostname;
  } catch (error) {
    return false;
  }
  return host.slice(-10) === ".nu.edu.pk" && host !== "flexstudent.nu.edu.pk";
}

async function remotefetch(input, init) {
  var address = typeof input === "string" ? input : input.url;
  var raw = "";
  var data = {};
  if (!campushost(address) || !window.SFNative) return window.fetch(input, init);
  raw = window.SFNative.fetchText(address);
  data = JSON.parse(raw);
  if (!data.status) throw new TypeError("Network request failed");
  return new Response(data.body, { status: data.status });
}

var bgchrome = build("bg");
var ctchrome = build("ct");
Object.defineProperty(window, "chrome", { value: ctchrome, configurable: true, writable: false });
