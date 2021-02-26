/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-env browser */
/* global devkitUUID */

const defaultURLLocalStorageKey = "batch_devkit_saved_url";

const defaultFormatURL = (() => {
  const savedURL = localStorage.getItem(defaultURLLocalStorageKey);
  if (typeof savedURL === "string" && savedURL.length > 0) {
    return savedURL;
  }
  return "http://localhost:9094/devkit/samples/debug";
})();

/* global Vue */
const app = new Vue({
  el: "#app-root",
  data: {
    formatURL: defaultFormatURL,
    iframe: {
      src: defaultFormatURL,
      key: 0,
    },
    events: [],
    rawCustomPayload: "{}",
  },
  methods: {
    appendEvent: function (method, args, reply) {
      this.events.push({ method, args, reply });
    },
    loadURL: function () {
      console.log("Loading ", this.formatURL);
      this.iframe.src = this.formatURL;
      this.iframe.key = this.iframe.key + 1;
    },
    saveURL: function () {
      localStorage.setItem(defaultURLLocalStorageKey, this.formatURL);
    },
    forgetURL: function () {
      localStorage.removeItem(defaultURLLocalStorageKey);
    },
    getJSONCustomPayload: function () {
      try {
        const json = JSON.parse(this.rawCustomPayload);
        if (Array.isArray(json) || typeof json !== "object") {
          return undefined;
        }
        return json;
      } catch {
        return undefined;
      }
    },
    isCustomPayloadValid: function () {
      return this.getJSONCustomPayload() !== undefined;
    },
  },
});

function handleBatchMessage(method, args, taskID) {
  // All Batch messages require a reply
  // Some will only require an identifier
  // Others require a more complex payload
  // Ones that don't really expect an answer can get anything, so send "ok"
  // Note: undefined (or null) can be replied
  let reply = "ok";
  let error;
  switch (method.toLowerCase()) {
    case "opendeeplink":
    case "performaction":
    case "dismiss":
      break;
    case "getcustomuserid":
    case "getcustomregion":
    case "getcustomlanguage":
      reply = undefined;
      break;
    case "getattributionid":
      error = `Advertising ID isn't supported in previews`;
      break;
    case "getinstallationid":
      reply = devkitUUID();
      break;
    case "gettrackingid":
      reply = "my_awesome_tracking_campaign1";
      break;
    case "getcustompayload": {
      let customPayload = app.getJSONCustomPayload();
      if (customPayload === undefined) {
        customPayload = {};
      }
      reply = JSON.stringify(customPayload);
      break;
    }
    default:
      error = `unknown method ${method}`;
      break;
  }
  app.appendEvent(method, args, reply);
  sendBatchCallback(taskID, error, error ? undefined : reply);
}

function sendBatchCallback(taskID, error, result) {
  document.getElementById("preview-frame").contentWindow.postMessage(
    {
      from: "batch-in_app-sdk-callback",
      taskID,
      error,
      result,
    },
    "*"
  );
}

window.addEventListener(
  "message",
  (event) => {
    const eventData = event.data;
    if (
      eventData != null &&
      typeof eventData === "object" &&
      eventData.from === "batch-in_app-sdk"
    ) {
      handleBatchMessage(eventData.method, eventData.args, eventData.taskID);
    }
  },
  false
);
