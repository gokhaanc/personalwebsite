import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../js/now.js", import.meta.url), "utf8");
const state = { timers: [] };

function classList() {
  const classes = new Set();
  return {
    toggle(name, force) {
      if (force) classes.add(name);
      else classes.delete(name);
    },
    contains(name) {
      return classes.has(name);
    }
  };
}

const clock = {};
const year = {};
const copyLabel = {};
const copyHint = {};
const copyLive = {};
const copyIcon = { classList: classList() };
const checkIcon = { classList: classList() };
const copyButton = {
  dataset: { copyEmail: "hi@gokhan.pw" },
  setAttribute(name, value) {
    state[name] = value;
  },
  addEventListener(type, handler) {
    if (type === "click") state.clickHandler = handler;
  }
};

const selectors = new Map([
  ["[data-clock]", clock],
  ["[data-year]", year],
  ["[data-copy-email]", copyButton],
  ["[data-copy-label]", copyLabel],
  ["[data-copy-hint]", copyHint],
  ["[data-copy-icon]", copyIcon],
  ["[data-check-icon]", checkIcon],
  ["[data-copy-live]", copyLive]
]);

const document = {
  body: { appendChild() {} },
  querySelector(selector) {
    return selectors.get(selector) ?? null;
  },
  querySelectorAll() {
    return [];
  },
  createElement() {
    return {
      style: {},
      setAttribute() {},
      select() {},
      setSelectionRange() {},
      remove() {}
    };
  },
  execCommand(command) {
    state.command = command;
    return command === "copy";
  }
};

const window = {
  isSecureContext: false,
  clearTimeout() {},
  setTimeout(handler, delay) {
    state.timers.push({ handler, delay });
    return state.timers.length;
  }
};

const context = { document, navigator: {}, window, Intl, Date };
vm.runInNewContext(source, context, { filename: "js/now.js" });
await state.clickHandler();

const result = {
  command: state.command,
  label: copyLabel.textContent,
  hint: copyHint.textContent,
  live: copyLive.textContent,
  checkVisible: checkIcon.classList.contains("is-visible"),
  resetDelay: state.timers.at(-1)?.delay
};

if (
  result.command !== "copy" ||
  result.label !== "Copied email" ||
  result.hint !== "To clipboard" ||
  result.checkVisible !== true ||
  result.resetDelay !== 1800
) {
  throw new Error(`Fallback copy test failed: ${JSON.stringify(result)}`);
}

console.log(JSON.stringify(result));
