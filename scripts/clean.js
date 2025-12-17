import fs from "fs";
import path from "path";

function isConsoleLog(code, startIndex) {
  const consolePattern = /^\s*console\.log\s*\(/;
  let lineStart = startIndex;

  while (lineStart > 0 && code[lineStart - 1] !== "\n") {
    lineStart--;
  }

  const lineContent = code.slice(lineStart, code.indexOf("\n", lineStart));
  return consolePattern.test(lineContent);
}

function findConsoleLogEnd(code, startIndex) {
  let i = startIndex;
  let parenCount = 0;
  let foundOpenParen = false;

  while (i < code.length && code[i] !== "(") {
    i++;
  }

  if (i >= code.length) return startIndex;

  parenCount = 1;
  i++;
  foundOpenParen = true;

  while (i < code.length && parenCount > 0) {
    if (code[i] === "\\") {
      i += 2;
      continue;
    }

    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const quote = code[i];
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === "\\") {
          i += 2;
        } else {
          i++;
        }
      }
      if (i < code.length) i++;
      continue;
    }

    if (code[i] === "(") parenCount++;
    else if (code[i] === ")") parenCount--;

    i++;
  }

  while (i < code.length && code[i] !== ";" && code[i] !== "\n") {
    i++;
  }

  if (i < code.length && code[i] === ";") {
    i++;
  }

  return i;
}

function processContent(code) {
  let out = "";
  let i = 0;
  const len = code.length;
  let state = "normal";

  while (i < len) {
    const ch = code[i];

    if (state === "normal") {
      if (i === 0 && ch === "#" && code[i + 1] === "!") {
        let j = i;
        while (j < len && code[j] !== "\n") j++;
        out += code.slice(i, j);
        i = j;
        continue;
      }

      if (ch === "c" && isConsoleLog(code, i)) {
        const endIndex = findConsoleLogEnd(code, i);

        let newlineCount = 0;
        for (let k = i; k < endIndex; k++) {
          if (code[k] === "\n") newlineCount++;
        }

        if (newlineCount > 0) {
          out += "\n".repeat(newlineCount);
        }

        i = endIndex;
        continue;
      }

      if (ch === "/" && code[i + 1] === "/") {
        let j = i + 2;

        while (j < len && code[j] !== "\n") j++;

        if (j < len && code[j] === "\n") {
          out += "\n";
          j++;
        }
        i = j;
        continue;
      }

      if (ch === "/" && code[i + 1] === "*") {
        let j = i + 2;
        let newlines = 0;
        while (j < len && !(code[j] === "*" && code[j + 1] === "/")) {
          if (code[j] === "\n") newlines++;
          j++;
        }

        if (j < len && code[j] === "*" && code[j + 1] === "/") {
          j += 2;
        }

        if (newlines > 0) {
          out += "\n".repeat(newlines);
        } else {
          out += " ";
        }
        i = j;
        continue;
      }

      if (ch === "'") {
        state = "sq";
        out += ch;
        i++;
        continue;
      }
      if (ch === '"') {
        state = "dq";
        out += ch;
        i++;
        continue;
      }
      if (ch === "`") {
        state = "bt";
        out += ch;
        i++;
        continue;
      }

      out += ch;
      i++;
    } else if (state === "sq") {
      if (code[i] === "\\") {
        out += code[i] + (code[i + 1] || "");
        i += 2;
        continue;
      }
      if (code[i] === "'") {
        out += "'";
        i++;
        state = "normal";
        continue;
      }
      out += code[i];
      i++;
    } else if (state === "dq") {
      if (code[i] === "\\") {
        out += code[i] + (code[i + 1] || "");
        i += 2;
        continue;
      }
      if (code[i] === '"') {
        out += '"';
        i++;
        state = "normal";
        continue;
      }
      out += code[i];
      i++;
    } else if (state === "bt") {
      if (code[i] === "\\") {
        out += code[i] + (code[i + 1] || "");
        i += 2;
        continue;
      }
      if (code[i] === "`") {
        out += "`";
        i++;
        state = "normal";
        continue;
      }

      if (code[i] === "$" && code[i + 1] === "{") {
        out += "${";
        i += 2;
        let depth = 1;
        while (i < len && depth > 0) {
          if (code[i] === "\\") {
            out += code[i] + (code[i + 1] || "");
            i += 2;
            continue;
          }
          if (code[i] === "{") depth++;
          else if (code[i] === "}") depth--;
          out += code[i];
          i++;
        }
        continue;
      }
      out += code[i];
      i++;
    }
  }

  return out;
}

function clean(dir, options = {}) {
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!["node_modules", "build"].includes(file)) {
        clean(filePath, options);

        if (options.removeEmptyFolders && isDirectoryEmpty(filePath)) {
          fs.rmdirSync(filePath);
        }
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      const code = fs.readFileSync(filePath, "utf8");
      const cleaned = processContent(code);
      fs.writeFileSync(filePath, cleaned, "utf8");
    }
  }
}

function isDirectoryEmpty(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  } catch (error) {
    return false;
  }
}

function processSingleFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const cleaned = processContent(code);
  fs.writeFileSync(filePath, cleaned, "utf8");
}

function showHelp() {}

const args = process.argv.slice(2);
let target = ".";
let removeEmptyFolders = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === "--help" || arg === "-h") {
    showHelp();
    process.exit(0);
  } else if (arg === "--remove-empty-folders") {
    removeEmptyFolders = true;
  } else if (!arg.startsWith("--")) {
    target = arg;
  }
}

const stat = fs.existsSync(target) ? fs.statSync(target) : null;
if (!stat) {
  console.error(`Path not found: ${target}`);
  process.exit(1);
}

const options = { removeEmptyFolders };

if (stat.isDirectory()) {
  if (removeEmptyFolders) {
  }
  clean(target, options);
} else {
  processSingleFile(target);
}
