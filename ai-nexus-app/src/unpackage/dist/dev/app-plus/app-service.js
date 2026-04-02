if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_LOAD = "onLoad";
  const ON_BACK_PRESS = "onBackPress";
  const ON_NAVIGATION_BAR_BUTTON_TAP = "onNavigationBarButtonTap";
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const onBackPress = /* @__PURE__ */ createLifeCycleHook(
    ON_BACK_PRESS,
    2
    /* HookFlags.PAGE */
  );
  const onNavigationBarButtonTap = /* @__PURE__ */ createLifeCycleHook(
    ON_NAVIGATION_BAR_BUTTON_TAP,
    2
    /* HookFlags.PAGE */
  );
  var isVue2 = false;
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject$1(o) {
    return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store) {
    return isPinia(store) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store.$id,
      label: store.$id
    };
  }
  function formatStoreForInspectorState(store) {
    if (isPinia(store)) {
      const storeNames = Array.from(store._s.keys());
      const storeMap = store._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store2 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store2._getters.reduce((getters, key) => {
              getters[key] = store2[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store.$state).map((key) => ({
        editable: true,
        key,
        value: store.$state[key]
      }))
    };
    if (store._getters && store._getters.length) {
      state.getters = store._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store[getterName]
      }));
    }
    if (store._customProperties.size) {
      state.customProperties = Array.from(store._customProperties).map((key) => ({
        editable: true,
        key,
        value: store[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store = pinia._s.get(nodeId);
              if (!store) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store) => {
            payload.instanceData.state.push({
              type: getStoreType(store.$id),
              key: "state",
              editable: true,
              value: store._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store.$state).reduce((state, key) => {
                  state[key] = store.$state[key];
                  return state;
                }, {})
              )
            });
            if (store._getters && store._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store.$id),
                key: "getters",
                editable: false,
                value: store._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store) => "$id" in store ? store.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store = pinia._s.get(storeId);
          if (!store) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store) {
    if (!componentStateTypes.includes(getStoreType(store.$id))) {
      componentStateTypes.push(getStoreType(store.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store._hotUpdate;
      store._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store;
      store.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`"${store.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store, options }) {
    if (store.$id.startsWith("__hot:")) {
      return;
    }
    store._isOptionsAPI = !!options.state;
    patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
    const originalHotUpdate = store._hotUpdate;
    vue.toRaw(store)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject$1(targetValue) && isPlainObject$1(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject$1(targetValue) && isPlainObject$1(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function shouldHydrate(obj) {
    return !isPlainObject$1(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o) {
    return !!(vue.isRef(o) && o.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store2 = pinia._s.get(id);
          return getters[name].call(store2, store2);
        }));
        return computedGetters;
      }, {}));
    }
    store = createSetupStore(id, setup, options, pinia, hot, true);
    return store;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store, args);
        } catch (error) {
          triggerSubscriptions(onErrorCallbackList, error);
          throw error;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store, setupStore);
      assign(vue.toRaw(store), setupStore);
    }
    Object.defineProperty(store, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store._hotUpdate = vue.markRaw((newStore) => {
        store._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject$1(newStateTarget) && isPlainObject$1(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set(store, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store, store);
            })
          ) : getter;
          set(store, getterName, getterValue);
        }
        Object.keys(store._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store, key);
          }
        });
        Object.keys(store._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store, key);
          }
        });
        store._hmrPayload = newStore._hmrPayload;
        store._getters = newStore._getters;
        store._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
        Object.defineProperty(store, p, assign({ value: store[p] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
        assign(store, extensions);
      } else {
        assign(store, scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore._pinia = pinia;
        }
      }
      const store = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store;
        }
      }
      return store;
    }
    useStore.$id = id;
    return useStore;
  }
  const AUTH_ROUTE = "/pages/profile/auth";
  const COMPANY_SESSION_TOKEN_KEY = "companySessionToken";
  const COMPANY_USER_INFO_KEY = "companyUserInfo";
  const LEGACY_TOKEN_KEY = "token";
  const LEGACY_USER_INFO_KEY = "userInfo";
  const PUBLIC_ROUTES = /* @__PURE__ */ new Set([AUTH_ROUTE]);
  const isPlainObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
  const normalizeRoute = (route) => {
    const normalized = String(route || "").trim();
    if (!normalized)
      return "";
    return normalized.split("?")[0];
  };
  const routeRequiresAuth = (route) => {
    const normalized = normalizeRoute(route);
    if (!normalized)
      return false;
    return !PUBLIC_ROUTES.has(normalized);
  };
  const getStoredSessionToken = () => {
    const nextToken = String(
      uni.getStorageSync(COMPANY_SESSION_TOKEN_KEY) || uni.getStorageSync(LEGACY_TOKEN_KEY) || ""
    ).trim();
    return nextToken;
  };
  const setStoredSessionToken = (token) => {
    const nextToken = String(token || "").trim();
    if (nextToken) {
      uni.setStorageSync(COMPANY_SESSION_TOKEN_KEY, nextToken);
      uni.setStorageSync(LEGACY_TOKEN_KEY, nextToken);
      return;
    }
    uni.removeStorageSync(COMPANY_SESSION_TOKEN_KEY);
    uni.removeStorageSync(LEGACY_TOKEN_KEY);
  };
  const getStoredUserInfo = () => {
    const primary = uni.getStorageSync(COMPANY_USER_INFO_KEY);
    if (isPlainObject(primary))
      return primary;
    const legacy = uni.getStorageSync(LEGACY_USER_INFO_KEY);
    if (isPlainObject(legacy))
      return legacy;
    return null;
  };
  const setStoredUserInfo = (userInfo) => {
    if (isPlainObject(userInfo)) {
      uni.setStorageSync(COMPANY_USER_INFO_KEY, userInfo);
      uni.setStorageSync(LEGACY_USER_INFO_KEY, userInfo);
      return;
    }
    uni.removeStorageSync(COMPANY_USER_INFO_KEY);
    uni.removeStorageSync(LEGACY_USER_INFO_KEY);
  };
  const clearAuthSessionStorage = () => {
    setStoredSessionToken("");
    setStoredUserInfo(null);
  };
  const getCurrentUserScope = () => {
    const userInfo = getStoredUserInfo();
    if (!userInfo)
      return "guest";
    return String(userInfo.username || userInfo.id || "guest").trim() || "guest";
  };
  const buildAuthRedirectUrl = (redirectRoute = "") => {
    const normalized = normalizeRoute(redirectRoute);
    if (routeRequiresAuth(normalized)) {
      return `${AUTH_ROUTE}?redirect=${encodeURIComponent(redirectRoute)}`;
    }
    return AUTH_ROUTE;
  };
  const redirectToAuth = (redirectRoute = "") => {
    uni.reLaunch({ url: buildAuthRedirectUrl(redirectRoute) });
  };
  let unauthorizedHandler = null;
  let handling401 = false;
  let last401At = 0;
  const DEFAULT_API_BASE_URL = "http://121.89.87.255:10001";
  const DEFAULT_NEWS_BASE_URL = "http://8.135.4.46";
  const DEFAULT_OPENMAIC_BASE_URL = "http://8.135.4.46:3000";
  function setUnauthorizedHandler(fn) {
    unauthorizedHandler = typeof fn === "function" ? fn : null;
  }
  const normalizeStoredUrl = (value) => {
    if (!value)
      return "";
    const normalizedUrl = String(value).trim().replace(/\/+$/, "");
    if (!normalizedUrl)
      return "";
    if (/^https?:\/\/(10\.0\.2\.2|127\.0\.0\.1|localhost)(:\d+)?$/i.test(normalizedUrl))
      return "";
    return normalizedUrl;
  };
  const getConfiguredBaseUrl = (storageKey, fallbackUrl) => {
    const storedBaseUrl = normalizeStoredUrl(uni.getStorageSync(storageKey));
    if (storedBaseUrl)
      return storedBaseUrl;
    return fallbackUrl;
  };
  const getBaseUrl = () => getConfiguredBaseUrl("apiBaseUrl", DEFAULT_API_BASE_URL);
  const getNewsBaseUrl = () => getConfiguredBaseUrl("newsBaseUrl", DEFAULT_NEWS_BASE_URL);
  const getOpenmaicBaseUrl = () => getConfiguredBaseUrl("openmaicBaseUrl", DEFAULT_OPENMAIC_BASE_URL);
  const normalizeError = (statusCode, data) => {
    if (typeof data === "string")
      return data;
    if (data == null ? void 0 : data.detail)
      return data.detail;
    if (data == null ? void 0 : data.message)
      return data.message;
    if (statusCode === 404)
      return "Resource not found";
    if (statusCode >= 500)
      return "Server error, please retry later";
    return "Request failed";
  };
  const request = (options) => {
    const token = options.withAuth ? getStoredSessionToken() : "";
    const unifiedKey = uni.getStorageSync("unifiedApiKey");
    const baseUrl = options.baseUrl || getBaseUrl();
    const skipUnauthorizedRedirect = !!options.skipUnauthorizedRedirect;
    return new Promise((resolve, reject) => {
      uni.request({
        url: baseUrl + options.url,
        method: options.method || "GET",
        data: options.data,
        timeout: options.timeout || 18e4,
        header: {
          "Content-Type": "application/json",
          ...token ? { Authorization: `Bearer ${token}` } : {},
          ...unifiedKey ? { "X-Api-Key": unifiedKey } : {},
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 401) {
            if (!options.withAuth || skipUnauthorizedRedirect) {
              const error = new Error(normalizeError(res.statusCode, res.data));
              error.statusCode = res.statusCode;
              reject(error);
              return;
            }
            clearAuthSessionStorage();
            try {
              if (unauthorizedHandler)
                unauthorizedHandler();
            } catch (error) {
            }
            const now2 = Date.now();
            if (!handling401 || now2 - last401At > 2e3) {
              handling401 = true;
              last401At = now2;
              const pages = (getCurrentPages == null ? void 0 : getCurrentPages()) || [];
              const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : "";
              if (normalizeRoute(currentRoute) !== "/pages/profile/auth") {
                redirectToAuth(currentRoute);
              }
              setTimeout(() => {
                handling401 = false;
              }, 2200);
            }
            reject(new Error("Unauthorized"));
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const error = new Error(normalizeError(res.statusCode, res.data));
            error.statusCode = res.statusCode;
            reject(error);
            return;
          }
          resolve(res.data);
        },
        fail: (error) => {
          reject(new Error((error == null ? void 0 : error.errMsg) || "Network request failed"));
        }
      });
    });
  };
  const NEWS_BOARD_BY_TYPE = {
    business: "main",
    personal: "sub"
  };
  const normalizeNewsItem = (item = {}, index = 0) => {
    const score = item.viewsNum || item.total_score || item.score || "0";
    const source = item.source || item.tag || "AI资讯";
    const summary = item.summary || item.brief || item.description || `${source} 热榜内容，点击查看原文详情。`;
    return {
      id: item.newsId || item.id || `news-${index}`,
      title: item.title || "未命名资讯",
      summary,
      url: item.url || "",
      source,
      score,
      coverUrl: item.coverUrl || item.cover_url || "",
      raw: item
    };
  };
  const getNewsList = async (type = "business") => {
    const board = NEWS_BOARD_BY_TYPE[type] || NEWS_BOARD_BY_TYPE.business;
    const response = await request({
      baseUrl: getNewsBaseUrl(),
      url: `/api/ranks/${board}/weibo`,
      timeout: 18e4
    });
    return {
      ...response,
      list: Array.isArray(response == null ? void 0 : response.list) ? response.list.map((item, index) => normalizeNewsItem(item, index)) : []
    };
  };
  const loginSession = (data) => request({
    baseUrl: getNewsBaseUrl(),
    url: "/api/auth/sessions",
    method: "POST",
    data,
    timeout: 18e4,
    skipUnauthorizedRedirect: true
  });
  const registerSession = (data) => request({
    baseUrl: getNewsBaseUrl(),
    url: "/api/auth/register",
    method: "POST",
    data,
    timeout: 18e4,
    skipUnauthorizedRedirect: true
  });
  const logoutCurrentSession = () => request({
    baseUrl: getNewsBaseUrl(),
    url: "/api/auth/sessions/current",
    method: "DELETE",
    timeout: 18e4,
    withAuth: true,
    skipUnauthorizedRedirect: true
  });
  const generateCode = (prompt) => request({
    url: "/api/workshop/generate",
    method: "POST",
    data: { prompt },
    timeout: 6e5
  });
  const routeWorkshopInput = (text) => request({
    url: "/api/workshop/router",
    method: "POST",
    data: { text },
    timeout: 18e4
  });
  const getWorkshopHistoryRemote = () => request({ url: "/api/workshop/history", timeout: 18e4 });
  const saveWorkshopHistoryRemote = (list) => request({ url: "/api/workshop/history", method: "PUT", data: { list }, timeout: 18e4 });
  const normalizeUserInfo = (info) => {
    if (!info || typeof info !== "object")
      return null;
    const username = String(info.username || "").trim();
    const displayName = String(info.displayName || info.display_name || info.nickname || username).trim();
    return {
      ...info,
      username,
      displayName: displayName || username,
      nickname: String(info.nickname || displayName || username || "灵境用户").trim(),
      id: String(info.id || username || "guest").trim(),
      phone: String(info.phone || "").trim(),
      createdAt: String(info.createdAt || info.created_at || "").trim()
    };
  };
  const isUnauthorizedError = (error) => Number((error == null ? void 0 : error.statusCode) || 0) === 401;
  const useUserStore = defineStore("user", () => {
    const token = vue.ref(getStoredSessionToken());
    const userInfo = vue.ref(normalizeUserInfo(getStoredUserInfo()) || null);
    const apiBaseUrl = vue.ref(uni.getStorageSync("apiBaseUrl") || "");
    const isAuthenticated = vue.computed(() => {
      var _a;
      return !!token.value && !!((_a = userInfo.value) == null ? void 0 : _a.username);
    });
    const setToken = (t) => {
      const nextToken = String(t || "").trim();
      token.value = nextToken;
      setStoredSessionToken(nextToken);
    };
    const setUserInfo = (info) => {
      const normalized = normalizeUserInfo(info);
      userInfo.value = normalized;
      setStoredUserInfo(normalized);
    };
    const setApiBaseUrl = (value) => {
      apiBaseUrl.value = value;
      if (value) {
        uni.setStorageSync("apiBaseUrl", value);
      } else {
        uni.removeStorageSync("apiBaseUrl");
      }
    };
    const applyAuthResponse = (response) => {
      const nextToken = String((response == null ? void 0 : response.token) || "").trim();
      if (!nextToken) {
        throw new Error("登录成功，但后端没有返回 token");
      }
      setToken(nextToken);
      setUserInfo((response == null ? void 0 : response.user) || null);
      return userInfo.value;
    };
    const login = async (payload) => {
      const response = await loginSession(payload);
      return applyAuthResponse(response);
    };
    const register = async (payload) => {
      const response = await registerSession(payload);
      return applyAuthResponse(response);
    };
    const fetchUserInfo = async () => {
      return userInfo.value;
    };
    const logout = () => {
      token.value = "";
      userInfo.value = null;
      clearAuthSessionStorage();
    };
    const logoutRemote = async () => {
      try {
        if (token.value) {
          try {
            await logoutCurrentSession();
          } catch (error) {
            if (!isUnauthorizedError(error)) {
              throw error;
            }
          }
        }
      } finally {
        logout();
      }
    };
    return {
      token,
      userInfo,
      apiBaseUrl,
      isAuthenticated,
      setToken,
      setUserInfo,
      setApiBaseUrl,
      login,
      register,
      fetchUserInfo,
      logout,
      logoutRemote
    };
  });
  const getLayoutMetrics = () => {
    var _a;
    const systemInfo = uni.getSystemInfoSync();
    return {
      statusBarHeight: systemInfo.statusBarHeight || 0,
      safeAreaInsetsBottom: ((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) ?? 0
    };
  };
  const ROOT_PAGES = /* @__PURE__ */ new Set([
    "/pages/home/index",
    "/pages/crawl/index",
    "/pages/profile/index"
  ]);
  const navigateByPath = (path) => {
    if (!path)
      return;
    const [basePath] = path.split("?");
    if (ROOT_PAGES.has(basePath)) {
      uni.reLaunch({ url: path });
      return;
    }
    uni.navigateTo({ url: path });
  };
  const safeNavigateBack = (fallbackUrl = "/pages/home/index?openSidebar=1") => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
      return;
    }
    uni.reLaunch({ url: fallbackUrl });
  };
  const PROFILE_STORAGE_KEY = "localProfile";
  const PROFILE_TOAST_KEY = "profilePendingToast";
  const PROFILE_TOAST_TTL = 15e3;
  const DEFAULT_PROFILE = {
    nickname: "灵境体验官",
    gender: "未设置",
    bio: "正在用真机测试 AI 工坊、AI 学堂和 AI 观察哨的整体流程。"
  };
  const isLegacyProfileShape = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }
    return "nickname" in value || "gender" in value || "bio" in value;
  };
  const normalizeProfileScope = (scope) => {
    const normalized = String(scope || "").trim();
    return normalized || "guest";
  };
  const getStoredUserScope = () => {
    const userInfo = getStoredUserInfo();
    if (!userInfo || typeof userInfo !== "object") {
      return "guest";
    }
    return normalizeProfileScope(userInfo.username || userInfo.id || "guest");
  };
  const getProfileStorageBucket = () => {
    const raw = uni.getStorageSync(PROFILE_STORAGE_KEY);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {};
    }
    if (isLegacyProfileShape(raw)) {
      return {
        [getStoredUserScope()]: {
          ...DEFAULT_PROFILE,
          ...raw
        }
      };
    }
    return raw;
  };
  const getLocalProfile = (scope) => {
    const bucket = getProfileStorageBucket();
    const scopedProfile = bucket[normalizeProfileScope(scope || getStoredUserScope())];
    if (!scopedProfile || typeof scopedProfile !== "object" || Array.isArray(scopedProfile)) {
      return { ...DEFAULT_PROFILE };
    }
    return {
      ...DEFAULT_PROFILE,
      ...scopedProfile
    };
  };
  const saveLocalProfile = (patch = {}, scope) => {
    const profileScope = normalizeProfileScope(scope || getStoredUserScope());
    const bucket = getProfileStorageBucket();
    const nextProfile = {
      ...getLocalProfile(profileScope),
      ...patch
    };
    uni.setStorageSync(PROFILE_STORAGE_KEY, {
      ...bucket,
      [profileScope]: nextProfile
    });
    return nextProfile;
  };
  const setProfilePendingToast = (message) => {
    if (!message)
      return;
    uni.setStorageSync(PROFILE_TOAST_KEY, {
      message,
      createdAt: Date.now()
    });
  };
  const consumeProfilePendingToast = () => {
    const payload = uni.getStorageSync(PROFILE_TOAST_KEY);
    if (payload) {
      uni.removeStorageSync(PROFILE_TOAST_KEY);
    }
    if (!payload || typeof payload !== "object") {
      return "";
    }
    const message = typeof payload.message === "string" ? payload.message : "";
    const createdAt = Number(payload.createdAt || 0);
    if (!message || !createdAt) {
      return "";
    }
    if (Date.now() - createdAt > PROFILE_TOAST_TTL) {
      return "";
    }
    return message;
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const HOME_ROUTE = "/pages/home/index";
  const PROFILE_ROUTE = "/pages/profile/index";
  const _sfc_main$9 = {
    __name: "auth",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics();
      const userStore = useUserStore();
      const mode = vue.ref("login");
      const submitting = vue.ref(false);
      const agreementChecked = vue.ref(uni.getStorageSync("authAgreementAccepted") === "1");
      const redirectUrl = vue.ref(HOME_ROUTE);
      const showBack = vue.ref(false);
      const lastBackPressAt = vue.ref(0);
      const form = vue.ref({
        username: "",
        password: "",
        displayName: ""
      });
      const rememberedAccount = vue.computed(() => String(uni.getStorageSync("lastLoginUsername") || "").trim());
      const providerCopy = vue.computed(() => {
        if (rememberedAccount.value && mode.value === "login") {
          return `已识别上次登录账号：${rememberedAccount.value}`;
        }
        return mode.value === "login" ? "使用公司账号体系登录后进入应用。" : "注册完成后会自动登录并进入应用。";
      });
      const modeCaption = vue.computed(() => mode.value === "login" ? "进入你的 AI 工作空间" : "注册后即可同步个人身份");
      const submitLabel = vue.computed(() => mode.value === "login" ? "登录" : "完成注册");
      const toggleLabel = vue.computed(() => mode.value === "login" ? "新用户注册" : "返回登录");
      const ensureAgreed = () => {
        if (agreementChecked.value)
          return true;
        uni.showToast({ title: "请先勾选协议", icon: "none" });
        return false;
      };
      const redirectToTarget = () => {
        uni.reLaunch({ url: redirectUrl.value || HOME_ROUTE });
      };
      const tryAutoEnter = () => {
        if (userStore.isAuthenticated) {
          redirectToTarget();
        }
      };
      const hydrateLoginUsername = () => {
        if (mode.value === "login" && !form.value.username && rememberedAccount.value) {
          form.value.username = rememberedAccount.value;
        }
      };
      const toggleMode = () => {
        if (submitting.value)
          return;
        mode.value = mode.value === "login" ? "register" : "login";
        hydrateLoginUsername();
      };
      const toggleAgreement = () => {
        agreementChecked.value = !agreementChecked.value;
        uni.setStorageSync("authAgreementAccepted", agreementChecked.value ? "1" : "0");
      };
      const goBack = () => {
        safeNavigateBack(redirectUrl.value || PROFILE_ROUTE);
      };
      const validateForm = () => {
        const username = form.value.username.trim();
        const password = form.value.password.trim();
        const displayName = form.value.displayName.trim();
        if (!username) {
          throw new Error("请输入用户名");
        }
        if (!password) {
          throw new Error("请输入密码");
        }
        if (mode.value === "register" && password.length < 6) {
          throw new Error("注册密码至少需要 6 位");
        }
        return {
          username,
          password,
          display_name: displayName || username
        };
      };
      const handleSubmit = async () => {
        if (submitting.value)
          return;
        if (!ensureAgreed())
          return;
        try {
          const payload = validateForm();
          submitting.value = true;
          if (mode.value === "login") {
            await userStore.login({
              username: payload.username,
              password: payload.password
            });
            setProfilePendingToast("登录成功");
          } else {
            await userStore.register(payload);
            setProfilePendingToast("注册并登录成功");
          }
          uni.setStorageSync("lastLoginUsername", payload.username);
          redirectToTarget();
        } catch (error) {
          uni.showToast({ title: error.message || "提交失败", icon: "none" });
        } finally {
          submitting.value = false;
        }
      };
      const openMoreActions = () => {
        const itemList = mode.value === "login" ? ["切换到注册", "填入上次账号", "清空输入"] : ["切换到登录", "清空输入"];
        uni.showActionSheet({
          itemList,
          success: ({ tapIndex }) => {
            if (mode.value === "login") {
              if (tapIndex === 0) {
                toggleMode();
                return;
              }
              if (tapIndex === 1) {
                form.value.username = rememberedAccount.value;
                return;
              }
              if (tapIndex === 2) {
                form.value.username = "";
                form.value.password = "";
                return;
              }
            } else {
              if (tapIndex === 0) {
                toggleMode();
                return;
              }
              if (tapIndex === 1) {
                form.value.username = "";
                form.value.password = "";
                form.value.displayName = "";
              }
            }
          }
        });
      };
      onLoad((options = {}) => {
        mode.value = options.mode === "register" ? "register" : "login";
        if (options.redirect) {
          try {
            redirectUrl.value = decodeURIComponent(options.redirect);
          } catch (error) {
            redirectUrl.value = PROFILE_ROUTE;
          }
          showBack.value = true;
        } else {
          redirectUrl.value = HOME_ROUTE;
          showBack.value = false;
        }
        hydrateLoginUsername();
      });
      onShow(() => {
        tryAutoEnter();
      });
      onBackPress((options = {}) => {
        if (options.from === "navigateBack") {
          return false;
        }
        if (showBack.value) {
          goBack();
          return true;
        }
        if (mode.value === "register") {
          mode.value = "login";
          hydrateLoginUsername();
          return true;
        }
        const now2 = Date.now();
        if (now2 - lastBackPressAt.value < 1500) {
          plus.runtime.quit();
          return true;
        }
        lastBackPressAt.value = now2;
        uni.showToast({ title: "再按一次退出应用", icon: "none" });
        return true;
      });
      const __returned__ = { HOME_ROUTE, PROFILE_ROUTE, statusBarHeight, safeAreaInsetsBottom, userStore, mode, submitting, agreementChecked, redirectUrl, showBack, lastBackPressAt, form, rememberedAccount, providerCopy, modeCaption, submitLabel, toggleLabel, ensureAgreed, redirectToTarget, tryAutoEnter, hydrateLoginUsername, toggleMode, toggleAgreement, goBack, validateForm, handleSubmit, openMoreActions, computed: vue.computed, ref: vue.ref, get onBackPress() {
        return onBackPress;
      }, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get useUserStore() {
        return useUserStore;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      }, get safeNavigateBack() {
        return safeNavigateBack;
      }, get setProfilePendingToast() {
        return setProfilePendingToast;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-page" }, [
      vue.createElementVNode("view", { class: "auth-bg" }, [
        vue.createElementVNode("view", { class: "glow glow-primary" }),
        vue.createElementVNode("view", { class: "glow glow-secondary" })
      ]),
      vue.createElementVNode(
        "view",
        {
          class: "auth-shell",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight + 16}px`, paddingBottom: `${$setup.safeAreaInsetsBottom + 24}px` })
        },
        [
          $setup.showBack ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "top-action",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "top-action-icon" }, "‹")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "brand-block" }, [
            vue.createElementVNode("text", { class: "brand-title" }, "灵境"),
            vue.createElementVNode("text", { class: "brand-subtitle" }, "AI 教育工作台"),
            vue.createElementVNode(
              "text",
              { class: "brand-caption" },
              vue.toDisplayString($setup.modeCaption),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "form-block" }, [
            vue.createElementVNode("view", { class: "mode-pill" }, [
              vue.createElementVNode(
                "text",
                { class: "mode-pill-text" },
                vue.toDisplayString($setup.mode === "login" ? "账号登录" : "创建新账号"),
                1
                /* TEXT */
              )
            ]),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "auth-input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.username = $event),
              maxlength: "24",
              placeholder: $setup.mode === "login" ? "输入灵境号" : "设置灵境号",
              "placeholder-class": "auth-placeholder"
            }, null, 8, ["placeholder"]), [
              [vue.vModelText, $setup.form.username]
            ]),
            $setup.mode === "register" ? vue.withDirectives((vue.openBlock(), vue.createElementBlock(
              "input",
              {
                key: 0,
                class: "auth-input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.displayName = $event),
                maxlength: "24",
                placeholder: "输入显示名称（选填）",
                "placeholder-class": "auth-placeholder"
              },
              null,
              512
              /* NEED_PATCH */
            )), [
              [vue.vModelText, $setup.form.displayName]
            ]) : vue.createCommentVNode("v-if", true),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "auth-input",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.password = $event),
              password: "",
              maxlength: "32",
              placeholder: $setup.mode === "login" ? "输入灵境密码" : "设置灵境密码",
              "placeholder-class": "auth-placeholder"
            }, null, 8, ["placeholder"]), [
              [vue.vModelText, $setup.form.password]
            ]),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["submit-button", { disabled: $setup.submitting }]),
                onClick: $setup.handleSubmit
              },
              [
                vue.createElementVNode(
                  "text",
                  { class: "submit-button-text" },
                  vue.toDisplayString($setup.submitting ? "提交中..." : $setup.submitLabel),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode("view", {
              class: "agreement-row",
              onClick: $setup.toggleAgreement
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["agreement-checkbox", { checked: $setup.agreementChecked }])
                },
                null,
                2
                /* CLASS */
              ),
              vue.createElementVNode("text", { class: "agreement-text" }, "已阅读并同意服务协议和灵境隐私保护指引")
            ]),
            vue.createElementVNode(
              "text",
              { class: "helper-text" },
              vue.toDisplayString($setup.providerCopy),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "bottom-actions" }, [
            vue.createElementVNode("view", {
              class: "action-item",
              onClick: $setup.toggleMode
            }, [
              vue.createElementVNode("view", { class: "action-circle" }, [
                vue.createElementVNode(
                  "text",
                  { class: "action-circle-text" },
                  vue.toDisplayString($setup.mode === "login" ? "+" : "↺"),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "text",
                { class: "action-label" },
                vue.toDisplayString($setup.toggleLabel),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "action-item",
              onClick: $setup.openMoreActions
            }, [
              vue.createElementVNode("view", { class: "action-circle" }, [
                vue.createElementVNode("text", { class: "action-circle-text" }, "···")
              ]),
              vue.createElementVNode("text", { class: "action-label" }, "更多")
            ])
          ])
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const PagesProfileAuth = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-c116c0e0"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/profile/auth.vue"]]);
  const ANIMATION_MS = 220;
  const _sfc_main$8 = {
    __name: "Sidebar",
    props: {
      visible: Boolean,
      activeSection: {
        type: String,
        default: "workshop"
      },
      workshopHistory: {
        type: Array,
        default: () => []
      }
    },
    emits: ["close", "navigate"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics();
      const userStore = useUserStore();
      const rendered = vue.ref(props.visible);
      const isClosing = vue.ref(false);
      let closeTimer = null;
      vue.watch(
        () => props.visible,
        (nextVisible) => {
          if (nextVisible) {
            rendered.value = true;
            isClosing.value = false;
            if (closeTimer)
              clearTimeout(closeTimer);
            closeTimer = null;
            return;
          }
          if (!rendered.value)
            return;
          isClosing.value = true;
          if (closeTimer)
            clearTimeout(closeTimer);
          closeTimer = setTimeout(() => {
            rendered.value = false;
            isClosing.value = false;
            closeTimer = null;
          }, ANIMATION_MS);
        },
        { immediate: true }
      );
      const menuItems = [
        { id: "school", name: "AI学堂", path: "/pages/school/input" },
        { id: "crawl", name: "AI观察哨", path: "/pages/crawl/index" },
        { id: "workshop", name: "AI工坊", path: "/pages/home/index" }
      ];
      const recentHistory = vue.computed(() => {
        const source = Array.isArray(props.workshopHistory) ? props.workshopHistory : [];
        return source.slice(0, 8);
      });
      const profileName = vue.computed(() => {
        var _a, _b, _c;
        if (!userStore.isAuthenticated)
          return "个人信息";
        return ((_a = userStore.userInfo) == null ? void 0 : _a.nickname) || ((_b = userStore.userInfo) == null ? void 0 : _b.displayName) || ((_c = userStore.userInfo) == null ? void 0 : _c.username) || "个人信息";
      });
      const profileSubtitle = vue.computed(() => {
        var _a;
        if (!userStore.isAuthenticated)
          return "查看资料与设置";
        return ((_a = userStore.userInfo) == null ? void 0 : _a.username) || "查看资料与设置";
      });
      const avatarInitial = vue.computed(() => {
        const source = profileName.value || "灵";
        return String(source).trim().slice(0, 1) || "灵";
      });
      const handleMenuClick = (item) => {
        if (item.id === "workshop") {
          startNewConversation();
          return;
        }
        if (item.id === props.activeSection) {
          emit("close");
          return;
        }
        emit("navigate", item.path);
        emit("close");
      };
      const startNewConversation = () => {
        emit("navigate", "/pages/home/index?reset=1");
        emit("close");
      };
      const openHistory = (id) => {
        emit("navigate", `/pages/home/index?chatId=${encodeURIComponent(id)}`);
        emit("close");
      };
      const goToProfile = () => {
        emit("navigate", "/pages/profile/index");
        emit("close");
      };
      const requestClose = () => {
        if (isClosing.value)
          return;
        isClosing.value = true;
        if (closeTimer)
          clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
          emit("close");
          closeTimer = null;
        }, ANIMATION_MS);
      };
      let touchStartX = 0;
      let touchStartY = 0;
      let touchLastX = 0;
      let touchLastY = 0;
      let touchTracking = false;
      const onTouchStart = (event) => {
        var _a;
        const touch = (_a = event == null ? void 0 : event.touches) == null ? void 0 : _a[0];
        if (!touch)
          return;
        touchTracking = true;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchLastX = touch.clientX;
        touchLastY = touch.clientY;
      };
      const onTouchMove = (event) => {
        var _a;
        if (!touchTracking)
          return;
        const touch = (_a = event == null ? void 0 : event.touches) == null ? void 0 : _a[0];
        if (!touch)
          return;
        touchLastX = touch.clientX;
        touchLastY = touch.clientY;
      };
      const onTouchEnd = () => {
        if (!touchTracking)
          return;
        touchTracking = false;
        const dx = touchLastX - touchStartX;
        const dy = touchLastY - touchStartY;
        if (dx < -70 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          requestClose();
        }
      };
      vue.onUnmounted(() => {
        if (closeTimer)
          clearTimeout(closeTimer);
      });
      const __returned__ = { props, emit, statusBarHeight, safeAreaInsetsBottom, userStore, ANIMATION_MS, rendered, isClosing, get closeTimer() {
        return closeTimer;
      }, set closeTimer(v) {
        closeTimer = v;
      }, menuItems, recentHistory, profileName, profileSubtitle, avatarInitial, handleMenuClick, startNewConversation, openHistory, goToProfile, requestClose, get touchStartX() {
        return touchStartX;
      }, set touchStartX(v) {
        touchStartX = v;
      }, get touchStartY() {
        return touchStartY;
      }, set touchStartY(v) {
        touchStartY = v;
      }, get touchLastX() {
        return touchLastX;
      }, set touchLastX(v) {
        touchLastX = v;
      }, get touchLastY() {
        return touchLastY;
      }, set touchLastY(v) {
        touchLastY = v;
      }, get touchTracking() {
        return touchTracking;
      }, set touchTracking(v) {
        touchTracking = v;
      }, onTouchStart, onTouchMove, onTouchEnd, computed: vue.computed, onUnmounted: vue.onUnmounted, ref: vue.ref, watch: vue.watch, get useUserStore() {
        return useUserStore;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return $setup.rendered ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "sidebar-wrapper"
    }, [
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["sidebar-mask", { closing: $setup.isClosing }]),
          onClick: $setup.requestClose
        },
        null,
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["sidebar-panel", { closing: $setup.isClosing }]),
          onTouchstart: $setup.onTouchStart,
          onTouchmove: $setup.onTouchMove,
          onTouchend: $setup.onTouchEnd,
          onTouchcancel: $setup.onTouchEnd
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "sidebar-header",
              style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight + 6}px` })
            },
            [
              vue.createElementVNode("view", { class: "brand-row" }, [
                vue.createElementVNode("text", { class: "brand-title" }, "灵境")
              ])
            ],
            4
            /* STYLE */
          ),
          vue.createElementVNode("scroll-view", {
            class: "sidebar-scroll",
            "scroll-y": "",
            "show-scrollbar": ""
          }, [
            vue.createElementVNode("view", {
              class: "quick-action",
              onClick: $setup.startNewConversation
            }, [
              vue.createElementVNode("text", { class: "quick-action-text" }, "开启新对话")
            ]),
            vue.createElementVNode("view", { class: "menu-group" }, [
              (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.menuItems, (item) => {
                  return vue.createElementVNode("view", {
                    key: item.id,
                    class: vue.normalizeClass(["menu-item", { active: item.id === $props.activeSection }]),
                    onClick: ($event) => $setup.handleMenuClick(item)
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "menu-label" },
                      vue.toDisplayString(item.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "menu-arrow" }, "›")
                  ], 10, ["onClick"]);
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            vue.createElementVNode("view", { class: "history-block" }, [
              vue.createElementVNode("view", { class: "history-divider" }),
              vue.createElementVNode("text", { class: "history-window" }, "30天内"),
              $setup.recentHistory.length ? (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                { key: 0 },
                vue.renderList($setup.recentHistory, (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: item.id,
                    class: "history-item",
                    onClick: ($event) => $setup.openHistory(item.id)
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "history-item-text" },
                      vue.toDisplayString(item.prompt || "未命名对话"),
                      1
                      /* TEXT */
                    )
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              )) : (vue.openBlock(), vue.createElementBlock("text", {
                key: 1,
                class: "history-empty"
              }, "没有更多内容啦"))
            ])
          ]),
          vue.createElementVNode(
            "view",
            {
              class: "profile-anchor",
              style: vue.normalizeStyle({ paddingBottom: `${$setup.safeAreaInsetsBottom + 16}px` }),
              onClick: $setup.goToProfile
            },
            [
              vue.createElementVNode("view", { class: "profile-avatar" }, [
                vue.createElementVNode(
                  "text",
                  { class: "profile-avatar-text" },
                  vue.toDisplayString($setup.avatarInitial),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "profile-meta" }, [
                vue.createElementVNode(
                  "text",
                  { class: "profile-name" },
                  vue.toDisplayString($setup.profileName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "profile-subtitle" },
                  vue.toDisplayString($setup.profileSubtitle),
                  1
                  /* TEXT */
                )
              ])
            ],
            4
            /* STYLE */
          )
        ],
        34
        /* CLASS, NEED_HYDRATION */
      )
    ])) : vue.createCommentVNode("v-if", true);
  }
  const Sidebar = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-3801e5de"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/components/Sidebar.vue"]]);
  const WorkshopIntent = {
    GenerateWorkshop: "generate_workshop",
    News: "news",
    School: "school",
    Help: "help"
  };
  const GENERATE_KEYWORDS = [
    "生成",
    "制作",
    "开发",
    "写一个",
    "做一个",
    "做个",
    "页面",
    "网页",
    "网站",
    "小程序",
    "小游戏",
    "应用",
    "app",
    "h5",
    "html",
    "ui",
    "登录页",
    "贪吃蛇"
  ];
  const NEWS_KEYWORDS = [
    "资讯",
    "新闻",
    "热点",
    "榜单",
    "crawl"
  ];
  const SCHOOL_KEYWORDS = [
    "学堂",
    "课堂",
    "课程",
    "教学",
    "学习",
    "school",
    "openmaic"
  ];
  const containsAnyKeyword = (text, keywords) => keywords.some((keyword) => text.includes(keyword));
  const classifyWorkshopInput = (input = "") => {
    const normalized = String(input).trim().toLowerCase();
    if (!normalized) {
      return { intent: WorkshopIntent.Help };
    }
    if (containsAnyKeyword(normalized, GENERATE_KEYWORDS)) {
      return { intent: WorkshopIntent.GenerateWorkshop };
    }
    if (containsAnyKeyword(normalized, NEWS_KEYWORDS)) {
      return { intent: WorkshopIntent.News };
    }
    if (containsAnyKeyword(normalized, SCHOOL_KEYWORDS)) {
      return { intent: WorkshopIntent.School };
    }
    return { intent: WorkshopIntent.Help };
  };
  const WORKSHOP_HISTORY_KEY = "workshopHistory";
  const WORKSHOP_HISTORY_BUCKET_KEY = "workshopHistoryByUser";
  const normalizeHistoryItem = (item = {}) => ({
    id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    prompt: item.prompt || "",
    result: item.result || null,
    createdAt: item.createdAt || Date.now()
  });
  const normalizeWorkshopScope = (scope) => {
    const normalized = String(scope || "").trim();
    return normalized || "guest";
  };
  const getWorkshopHistoryBucket = () => {
    const scoped = uni.getStorageSync(WORKSHOP_HISTORY_BUCKET_KEY);
    if (scoped && typeof scoped === "object" && !Array.isArray(scoped)) {
      return scoped;
    }
    const legacy = uni.getStorageSync(WORKSHOP_HISTORY_KEY);
    if (Array.isArray(legacy)) {
      return {
        [normalizeWorkshopScope(getCurrentUserScope())]: legacy.map((item) => normalizeHistoryItem(item))
      };
    }
    return {};
  };
  const getWorkshopHistory = (scope) => {
    const bucket = getWorkshopHistoryBucket();
    const raw = bucket[normalizeWorkshopScope(scope || getCurrentUserScope())];
    if (!Array.isArray(raw))
      return [];
    return raw.map((item) => normalizeHistoryItem(item)).sort((a, b) => b.createdAt - a.createdAt);
  };
  const setWorkshopHistory = (list = [], scope) => {
    const workshopScope = normalizeWorkshopScope(scope || getCurrentUserScope());
    const bucket = getWorkshopHistoryBucket();
    const nextHistory = (Array.isArray(list) ? list : []).map((item) => normalizeHistoryItem(item));
    uni.setStorageSync(WORKSHOP_HISTORY_BUCKET_KEY, {
      ...bucket,
      [workshopScope]: nextHistory
    });
    uni.setStorageSync(WORKSHOP_HISTORY_KEY, nextHistory);
    return nextHistory;
  };
  const getWorkshopConversation = (id, scope) => {
    if (!id)
      return null;
    return getWorkshopHistory(scope).find((item) => item.id === id) || null;
  };
  const saveWorkshopConversation = (conversation, scope) => {
    const nextConversation = normalizeHistoryItem(conversation);
    const history = getWorkshopHistory(scope).filter((item) => item.id !== nextConversation.id);
    history.unshift(nextConversation);
    setWorkshopHistory(history, scope);
    return nextConversation;
  };
  const loadingText = "正在生成页面并准备在线预览，请稍等片刻。";
  const _sfc_main$7 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const systemInfo = uni.getSystemInfoSync();
      const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics();
      const sidebarVisible = vue.ref(false);
      const userInput = vue.ref("");
      const loading = vue.ref(false);
      const generatedResult = vue.ref(null);
      const lastPrompt = vue.ref("");
      const loadingPhase = vue.ref(0);
      const workshopHistory = vue.ref([]);
      const currentConversationId = vue.ref("");
      let loadingTimer = null;
      const workshopSyncInFlight = vue.ref(false);
      const workshopSyncLastAt = vue.ref(0);
      const workshopSyncLastSignature = vue.ref("");
      const loadingPhases = [
        "正在理解需求",
        "正在生成页面结构",
        "正在整理运行代码",
        "正在准备在线预览"
      ];
      const chatHeight = Math.max(systemInfo.windowHeight - statusBarHeight - 190 - safeAreaInsetsBottom, 380);
      const hasPreview = vue.computed(() => {
        var _a;
        return !!((_a = generatedResult.value) == null ? void 0 : _a.previewUrl);
      });
      const activeLoadingPhase = vue.computed(() => loadingPhases[loadingPhase.value % loadingPhases.length]);
      const isAssistantReply = vue.computed(() => {
        var _a;
        return ((_a = generatedResult.value) == null ? void 0 : _a.kind) === "assistant";
      });
      const assistantActions = vue.computed(() => {
        var _a;
        return (((_a = generatedResult.value) == null ? void 0 : _a.quickActions) || []).filter((x) => (x == null ? void 0 : x.label) && (x == null ? void 0 : x.path));
      });
      const aiTitle = vue.computed(() => {
        if (loading.value)
          return "正在生成中";
        if (isAssistantReply.value)
          return "灵境助手";
        return "应用创建成功";
      });
      const aiBodyText = vue.computed(() => {
        var _a;
        if (loading.value)
          return loadingText;
        if (isAssistantReply.value)
          return ((_a = generatedResult.value) == null ? void 0 : _a.text) || "";
        return introText.value;
      });
      const introText = vue.computed(() => {
        var _a;
        if (!lastPrompt.value) {
          return "我会先理解你的需求，再产出一版可以继续打磨的页面代码。";
        }
        return ((_a = generatedResult.value) == null ? void 0 : _a.summary) || `围绕“${lastPrompt.value}”，我已经整理出页面结构和交互骨架。`;
      });
      const highlights = vue.computed(() => {
        if (isAssistantReply.value)
          return [];
        if (loading.value) {
          return ["模型已开始生成应用结构", "结果完成后会自动切换到预览卡片", "如果预览可用，可以直接打开试玩"];
        }
        if (hasPreview.value) {
          return ["已生成可访问的网页地址", "前端将通过 WebView 或浏览器承载运行", "后续可以继续做发布和分享流程"];
        }
        return ["保留核心玩法和页面骨架", "先生成可继续修改的代码结果", "下一步可以接入 WebView 或沙盒预览"];
      });
      const showHighlights = vue.computed(() => loading.value || !isAssistantReply.value && !!generatedResult.value);
      const toggleSidebar = () => {
        sidebarVisible.value = !sidebarVisible.value;
      };
      const closeSidebar = () => {
        sidebarVisible.value = false;
      };
      const handleNavigate = (path) => {
        navigateByPath(path);
      };
      const clearConversation = () => {
        currentConversationId.value = "";
        lastPrompt.value = "";
        generatedResult.value = null;
        userInput.value = "";
      };
      const syncWorkshopHistory = () => {
        workshopHistory.value = getWorkshopHistory();
      };
      const loadConversation = (chatId) => {
        const conversation = getWorkshopConversation(chatId);
        if (!conversation) {
          clearConversation();
          return;
        }
        currentConversationId.value = conversation.id;
        lastPrompt.value = conversation.prompt || "";
        generatedResult.value = conversation.result || null;
      };
      const mergeWorkshopHistory = (local = [], remote = []) => {
        const byId = /* @__PURE__ */ new Map();
        [...remote, ...local].forEach((item) => {
          if (!item || !item.id)
            return;
          const existing = byId.get(item.id);
          if (!existing) {
            byId.set(item.id, item);
            return;
          }
          const a = Number(existing.createdAt || 0);
          const b = Number(item.createdAt || 0);
          if (b > a)
            byId.set(item.id, item);
        });
        return Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      };
      const historySignature = (list = []) => {
        try {
          return JSON.stringify(
            (Array.isArray(list) ? list : []).map((x) => ({ id: (x == null ? void 0 : x.id) || "", createdAt: Number((x == null ? void 0 : x.createdAt) || 0) })).filter((x) => x.id).slice(0, 60)
          );
        } catch (e) {
          return "";
        }
      };
      const syncWorkshopHistoryRemote = async ({ silent = true } = {}) => {
        const now2 = Date.now();
        if (workshopSyncInFlight.value)
          return;
        if (now2 - workshopSyncLastAt.value < 12e3)
          return;
        const local = getWorkshopHistory();
        workshopHistory.value = local;
        try {
          workshopSyncInFlight.value = true;
          const res = await getWorkshopHistoryRemote();
          const remote = Array.isArray(res.list) ? res.list : [];
          const merged = mergeWorkshopHistory(local, remote);
          workshopHistory.value = merged;
          uni.setStorageSync("workshopHistory", merged);
          const mergedSig = historySignature(merged);
          const remoteSig = historySignature(remote);
          if (mergedSig && mergedSig !== remoteSig && mergedSig !== workshopSyncLastSignature.value) {
            try {
              await saveWorkshopHistoryRemote(merged);
              workshopSyncLastSignature.value = mergedSig;
            } catch (error) {
            }
          }
          workshopSyncLastAt.value = now2;
        } catch (error) {
          if (!silent) {
            uni.showToast({ title: error.message || "云端历史同步失败", icon: "none" });
          }
        } finally {
          workshopSyncInFlight.value = false;
        }
      };
      const startLoadingAnimation = () => {
        if (loadingTimer)
          clearInterval(loadingTimer);
        loadingPhase.value = 0;
        loadingTimer = setInterval(() => {
          loadingPhase.value = (loadingPhase.value + 1) % loadingPhases.length;
        }, 1200);
      };
      const stopLoadingAnimation = () => {
        if (!loadingTimer)
          return;
        clearInterval(loadingTimer);
        loadingTimer = null;
      };
      const openPreview = () => {
        var _a;
        if (!((_a = generatedResult.value) == null ? void 0 : _a.previewUrl))
          return;
        uni.navigateTo({
          url: `/pages/workshop/preview?url=${encodeURIComponent(generatedResult.value.previewUrl)}&title=${encodeURIComponent(generatedResult.value.title || "工坊预览")}`
        });
      };
      const runAssistantAction = (action) => {
        if (!(action == null ? void 0 : action.path))
          return;
        navigateByPath(action.path);
      };
      const buildAssistantReply = ({ intent }) => {
        const examples = ["做一个贪吃蛇小游戏", "生成一个登录页", "做一个记账小程序页面"];
        if (intent === "news") {
          return {
            kind: "assistant",
            text: `我可以带你去看 AI 资讯榜单。

你也可以继续在工坊里输入“${examples[0]}”这类指令来生成小游戏/页面原型。`,
            quickActions: [
              { label: "去 AI 资讯页", path: "/pages/crawl/index" },
              { label: "去 AI 学堂", path: "/pages/school/input" }
            ]
          };
        }
        if (intent === "school") {
          return {
            kind: "assistant",
            text: `我可以带你去 AI 学堂生成白板课堂。

如果你想在工坊生成小游戏/页面，请直接说：
- ${examples[0]}
- ${examples[1]}`,
            quickActions: [
              { label: "去 AI 学堂", path: "/pages/school/input" },
              { label: "去 AI 资讯页", path: "/pages/crawl/index" }
            ]
          };
        }
        return {
          kind: "assistant",
          text: `我能做两件事：
1) 在工坊帮你生成小游戏/页面原型
2) 带你跳转到 AI 资讯 / AI 学堂

如果你要生成，请这样说：
- ${examples[0]}
- ${examples[1]}
- ${examples[2]}`,
          quickActions: [
            { label: "去 AI 资讯页", path: "/pages/crawl/index" },
            { label: "去 AI 学堂", path: "/pages/school/input" }
          ]
        };
      };
      const handleGenerate = async () => {
        const prompt = userInput.value.trim();
        if (!prompt || loading.value) {
          if (!prompt)
            uni.showToast({ title: "请输入你的需求", icon: "none" });
          return;
        }
        lastPrompt.value = prompt;
        userInput.value = "";
        try {
          const routed = await routeWorkshopInput(prompt);
          if (!(routed == null ? void 0 : routed.shouldGenerate)) {
            generatedResult.value = {
              kind: "assistant",
              text: (routed == null ? void 0 : routed.replyText) || buildAssistantReply({ intent: (routed == null ? void 0 : routed.intent) || "help" }).text,
              quickActions: Array.isArray(routed == null ? void 0 : routed.quickActions) ? routed.quickActions : buildAssistantReply({ intent: (routed == null ? void 0 : routed.intent) || "help" }).quickActions
            };
            return;
          }
          lastPrompt.value = prompt;
        } catch (error) {
          const fallback = classifyWorkshopInput(prompt);
          if (fallback.intent !== WorkshopIntent.GenerateWorkshop) {
            generatedResult.value = buildAssistantReply({ intent: "help" });
            return;
          }
        }
        loading.value = true;
        generatedResult.value = null;
        startLoadingAnimation();
        try {
          const response = await generateCode(lastPrompt.value);
          generatedResult.value = response.result;
          const savedConversation = saveWorkshopConversation({
            id: currentConversationId.value || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
            prompt: lastPrompt.value,
            result: response.result,
            createdAt: Date.now()
          });
          currentConversationId.value = savedConversation.id;
          syncWorkshopHistory();
          workshopSyncLastAt.value = 0;
        } catch (error) {
          uni.showToast({ title: error.message, icon: "none" });
          userInput.value = prompt;
        } finally {
          loading.value = false;
          stopLoadingAnimation();
        }
      };
      vue.onUnmounted(() => {
        stopLoadingAnimation();
      });
      onLoad((query) => {
        syncWorkshopHistoryRemote({ silent: true });
        sidebarVisible.value = query.openSidebar === "1";
        if (query.reset === "1") {
          clearConversation();
          return;
        }
        if (query.chatId) {
          loadConversation(decodeURIComponent(query.chatId));
        }
      });
      onShow(() => {
        syncWorkshopHistoryRemote({ silent: true });
      });
      let lastBackPressAt = 0;
      onBackPress(() => {
        if (sidebarVisible.value) {
          closeSidebar();
          return true;
        }
        const now2 = Date.now();
        if (now2 - lastBackPressAt < 1500) {
          plus.runtime.quit();
          return true;
        }
        lastBackPressAt = now2;
        uni.showToast({ title: "再按一次退出应用", icon: "none" });
        return true;
      });
      const __returned__ = { systemInfo, statusBarHeight, safeAreaInsetsBottom, sidebarVisible, userInput, loading, generatedResult, lastPrompt, loadingPhase, workshopHistory, currentConversationId, get loadingTimer() {
        return loadingTimer;
      }, set loadingTimer(v) {
        loadingTimer = v;
      }, workshopSyncInFlight, workshopSyncLastAt, workshopSyncLastSignature, loadingPhases, chatHeight, hasPreview, loadingText, activeLoadingPhase, isAssistantReply, assistantActions, aiTitle, aiBodyText, introText, highlights, showHighlights, toggleSidebar, closeSidebar, handleNavigate, clearConversation, syncWorkshopHistory, loadConversation, mergeWorkshopHistory, historySignature, syncWorkshopHistoryRemote, startLoadingAnimation, stopLoadingAnimation, openPreview, runAssistantAction, buildAssistantReply, handleGenerate, get lastBackPressAt() {
        return lastBackPressAt;
      }, set lastBackPressAt(v) {
        lastBackPressAt = v;
      }, computed: vue.computed, onUnmounted: vue.onUnmounted, ref: vue.ref, get onBackPress() {
        return onBackPress;
      }, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, Sidebar, get generateCode() {
        return generateCode;
      }, get getWorkshopHistoryRemote() {
        return getWorkshopHistoryRemote;
      }, get routeWorkshopInput() {
        return routeWorkshopInput;
      }, get saveWorkshopHistoryRemote() {
        return saveWorkshopHistoryRemote;
      }, get navigateByPath() {
        return navigateByPath;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      }, get classifyWorkshopInput() {
        return classifyWorkshopInput;
      }, get WorkshopIntent() {
        return WorkshopIntent;
      }, get getWorkshopConversation() {
        return getWorkshopConversation;
      }, get getWorkshopHistory() {
        return getWorkshopHistory;
      }, get saveWorkshopConversation() {
        return saveWorkshopConversation;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "workshop-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "top-safe",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        null,
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("text", {
          class: "header-action",
          onClick: $setup.toggleSidebar
        }, "☰"),
        vue.createElementVNode("text", { class: "header-title" }, "AI 工坊"),
        vue.createElementVNode("view", { class: "header-placeholder" })
      ]),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "chat-scroll",
          "scroll-y": "",
          style: vue.normalizeStyle({ height: `${$setup.chatHeight}px` })
        },
        [
          vue.createElementVNode("view", { class: "chat-content" }, [
            $setup.lastPrompt ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "user-row"
            }, [
              vue.createElementVNode("view", { class: "user-bubble" }, [
                vue.createElementVNode(
                  "text",
                  { class: "user-text" },
                  vue.toDisplayString($setup.lastPrompt),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "message-time" }, "刚刚")
            ])) : vue.createCommentVNode("v-if", true),
            $setup.generatedResult || $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "ai-row"
            }, [
              vue.createElementVNode("view", { class: "ai-avatar" }, [
                vue.createElementVNode("text", { class: "ai-avatar-text" }, "AI")
              ]),
              vue.createElementVNode("view", { class: "ai-column" }, [
                vue.createElementVNode("view", { class: "ai-bubble" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "ai-title" },
                    vue.toDisplayString($setup.aiTitle),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "ai-text" },
                    vue.toDisplayString($setup.aiBodyText),
                    1
                    /* TEXT */
                  ),
                  $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "loading-panel"
                  }, [
                    vue.createElementVNode("view", { class: "loading-orbit" }, [
                      vue.createElementVNode("view", { class: "orbit-ring ring-one" }),
                      vue.createElementVNode("view", { class: "orbit-ring ring-two" }),
                      vue.createElementVNode("view", { class: "orbit-core" }, [
                        vue.createElementVNode("text", { class: "orbit-core-text" }, "AI")
                      ]),
                      vue.createElementVNode("view", { class: "orbit-dot dot-one" }),
                      vue.createElementVNode("view", { class: "orbit-dot dot-two" }),
                      vue.createElementVNode("view", { class: "orbit-dot dot-three" })
                    ]),
                    vue.createElementVNode("view", { class: "loading-meta" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "loading-phase" },
                        vue.toDisplayString($setup.activeLoadingPhase),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "loading-subtitle" }, "正在调用模型、整理代码并准备在线预览"),
                      vue.createElementVNode("view", { class: "loading-steps" }, [
                        (vue.openBlock(), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($setup.loadingPhases, (step, index) => {
                            return vue.createElementVNode(
                              "view",
                              {
                                key: step,
                                class: vue.normalizeClass(["loading-step", { active: index === $setup.loadingPhase }])
                              },
                              [
                                vue.createElementVNode("view", { class: "loading-step-dot" }),
                                vue.createElementVNode(
                                  "text",
                                  { class: "loading-step-text" },
                                  vue.toDisplayString(step),
                                  1
                                  /* TEXT */
                                )
                              ],
                              2
                              /* CLASS */
                            );
                          }),
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ])
                    ]),
                    vue.createElementVNode("view", { class: "loading-progress-track" }, [
                      vue.createElementVNode("view", { class: "loading-progress-bar" })
                    ])
                  ])) : vue.createCommentVNode("v-if", true),
                  $setup.showHighlights ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "idea-card"
                  }, [
                    vue.createElementVNode("text", { class: "idea-title" }, "这次生成重点"),
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.highlights, (point, index) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: "idea-item",
                          key: index
                        }, [
                          vue.createElementVNode("text", { class: "idea-dot" }, "•"),
                          vue.createElementVNode(
                            "text",
                            { class: "idea-text" },
                            vue.toDisplayString(point),
                            1
                            /* TEXT */
                          )
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : vue.createCommentVNode("v-if", true),
                  $setup.generatedResult && !$setup.isAssistantReply ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 2,
                    class: "result-card"
                  }, [
                    vue.createElementVNode("view", { class: "result-toolbar" }, [
                      vue.createElementVNode("text", {
                        class: "result-tool",
                        onClick: $setup.openPreview
                      }, "试玩"),
                      vue.createElementVNode("text", {
                        class: "result-tool",
                        onClick: $setup.openPreview
                      }, "发布"),
                      vue.createElementVNode("text", {
                        class: "result-tool",
                        onClick: $setup.openPreview
                      }, "全屏")
                    ]),
                    $setup.hasPreview ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "preview-shell preview-clickable",
                      onClick: $setup.openPreview
                    }, [
                      vue.createElementVNode("view", { class: "preview-header" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "preview-title" },
                          vue.toDisplayString($setup.generatedResult.title || "在线预览"),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "preview-badge" }, [
                          vue.createElementVNode("text", { class: "preview-badge-text" }, "WEB")
                        ])
                      ]),
                      vue.createElementVNode("view", { class: "preview-hero" }, [
                        vue.createElementVNode("text", { class: "preview-hero-title" }, "点击进入 WebView 试玩"),
                        vue.createElementVNode(
                          "text",
                          { class: "preview-hero-copy" },
                          vue.toDisplayString($setup.generatedResult.summary || "已生成可在线运行的页面预览。"),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "preview-cta" }, [
                          vue.createElementVNode("text", { class: "preview-cta-text" }, "立即打开")
                        ])
                      ])
                    ])) : (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "preview-shell"
                    }, [
                      vue.createElementVNode("view", { class: "preview-header" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "preview-title" },
                          vue.toDisplayString($setup.generatedResult.title || "生成结果"),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "preview-badge" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "preview-badge-text" },
                            vue.toDisplayString($setup.generatedResult.language || "html"),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      vue.createElementVNode("scroll-view", {
                        class: "preview-code-scroll",
                        "scroll-y": ""
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "preview-code" },
                          vue.toDisplayString($setup.generatedResult.code),
                          1
                          /* TEXT */
                        )
                      ])
                    ]))
                  ])) : vue.createCommentVNode("v-if", true),
                  $setup.isAssistantReply && $setup.assistantActions.length ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 3,
                    class: "assist-actions"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.assistantActions, (action) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: action.path,
                          class: "assist-action",
                          onClick: ($event) => $setup.runAssistantAction(action)
                        }, [
                          vue.createElementVNode(
                            "text",
                            { class: "assist-action-text" },
                            vue.toDisplayString(action.label),
                            1
                            /* TEXT */
                          )
                        ], 8, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("text", { class: "message-time" }, "刚刚")
              ])
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "empty-state"
            }, [
              vue.createElementVNode("text", { class: "empty-title" }, "描述你想做的应用"),
              vue.createElementVNode("text", { class: "empty-copy" }, " 比如“做一个贪吃蛇小游戏”或“生成一个登录页”，我会把它变成可以继续迭代的代码结果。 ")
            ]))
          ])
        ],
        4
        /* STYLE */
      ),
      $setup.generatedResult && $setup.hasPreview && !$setup.isAssistantReply ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "floating-action",
        onClick: $setup.openPreview
      }, [
        vue.createElementVNode("text", { class: "floating-action-text" }, "↗")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode(
        "view",
        {
          class: "input-area",
          style: vue.normalizeStyle({ paddingBottom: `${$setup.safeAreaInsetsBottom + 16}px` })
        },
        [
          vue.createElementVNode("view", { class: "input-shell" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "prompt-input",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.userInput = $event),
                placeholder: "输入消息...",
                "placeholder-class": "prompt-placeholder",
                "confirm-type": "send",
                maxlength: "500",
                onConfirm: $setup.handleGenerate
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.userInput]
            ])
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["send-button", { disabled: $setup.loading }]),
              onClick: $setup.handleGenerate
            },
            [
              vue.createElementVNode("text", { class: "send-button-text" }, "➜")
            ],
            2
            /* CLASS */
          )
        ],
        4
        /* STYLE */
      ),
      vue.createVNode($setup["Sidebar"], {
        visible: $setup.sidebarVisible,
        "active-section": "workshop",
        "workshop-history": $setup.workshopHistory,
        onClose: $setup.closeSidebar,
        onNavigate: $setup.handleNavigate
      }, null, 8, ["visible", "workshop-history"])
    ]);
  }
  const PagesHomeIndex = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-4978fed5"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/home/index.vue"]]);
  const _sfc_main$6 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight } = getLayoutMetrics();
      const topBarOffset = `${statusBarHeight + uni.upx2px(222)}px`;
      const newsScrollStyle = {
        marginTop: topBarOffset,
        height: `calc(100vh - ${topBarOffset})`
      };
      const activeTab = vue.ref("business");
      const newsList = vue.ref([]);
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const goBackToWorkshop = () => {
        uni.reLaunch({ url: "/pages/home/index?openSidebar=1" });
      };
      const switchTab = (tab) => {
        if (activeTab.value === tab)
          return;
        activeTab.value = tab;
        loadNews();
      };
      const loadNews = async () => {
        loading.value = true;
        refreshing.value = true;
        try {
          const response = await getNewsList(activeTab.value);
          newsList.value = response.list || [];
        } catch (error) {
          newsList.value = [];
          uni.showToast({ title: error.message, icon: "none" });
        } finally {
          loading.value = false;
          refreshing.value = false;
        }
      };
      const viewDetail = (item) => {
        if (!item.url)
          return;
        uni.navigateTo({
          url: `/pages/workshop/preview?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title || "新闻详情")}`
        });
      };
      vue.onMounted(() => {
        loadNews();
      });
      onBackPress((options = {}) => {
        if (options.from === "navigateBack") {
          return false;
        }
        goBackToWorkshop();
        return true;
      });
      const __returned__ = { statusBarHeight, topBarOffset, newsScrollStyle, activeTab, newsList, loading, refreshing, goBackToWorkshop, switchTab, loadNews, viewDetail, onMounted: vue.onMounted, ref: vue.ref, get onBackPress() {
        return onBackPress;
      }, get getNewsList() {
        return getNewsList;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "news-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "top-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("view", { class: "page-header" }, [
            vue.createElementVNode("view", {
              class: "header-side header-back",
              onClick: $setup.goBackToWorkshop
            }, [
              vue.createElementVNode("text", { class: "header-back-icon" }, "←")
            ]),
            vue.createElementVNode("text", { class: "header-title" }, "AI 观察哨"),
            vue.createElementVNode("view", { class: "header-side header-placeholder" })
          ]),
          vue.createElementVNode("view", { class: "segment-wrap" }, [
            vue.createElementVNode("view", { class: "segment-control" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["segment-item", { active: $setup.activeTab === "business" }]),
                  onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchTab("business"))
                },
                [
                  vue.createElementVNode("text", { class: "segment-text" }, "商业榜")
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["segment-item", { active: $setup.activeTab === "personal" }]),
                  onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchTab("personal"))
                },
                [
                  vue.createElementVNode("text", { class: "segment-text" }, "个人榜")
                ],
                2
                /* CLASS */
              )
            ])
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("scroll-view", {
        class: "news-scroll",
        style: $setup.newsScrollStyle,
        "scroll-y": "",
        "refresher-enabled": "",
        "refresher-triggered": $setup.refreshing,
        onRefresherrefresh: $setup.loadNews
      }, [
        $setup.newsList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "news-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.newsList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: item.id,
                class: "news-card",
                onClick: ($event) => $setup.viewDetail(item)
              }, [
                vue.createElementVNode("view", { class: "card-top" }, [
                  vue.createElementVNode("view", { class: "rank-chip" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "rank-chip-text" },
                      "#" + vue.toDisplayString(index + 1),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "card-score" },
                    "热度 " + vue.toDisplayString(item.score),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "card-title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "card-summary" },
                  vue.toDisplayString(item.summary),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "card-tags" }, [
                  vue.createElementVNode("view", { class: "tag primary" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "tag-text" },
                      vue.toDisplayString(item.source || "AI资讯速览"),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "tag" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "tag-text" },
                      vue.toDisplayString($setup.activeTab === "business" ? "商业" : "个人"),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading-state"
        }, [
          vue.createElementVNode("text", { class: "loading-title" }, "正在拉取资讯"),
          vue.createElementVNode("text", { class: "loading-copy" }, "首次启动后端时可能需要一点初始化时间，稍后下拉刷新即可。")
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-title" }, "还没有资讯内容"),
          vue.createElementVNode("text", { class: "empty-copy" }, "后端抓取完成后，这里会显示最新榜单。你也可以切换榜单类型再试一次。")
        ]))
      ], 40, ["refresher-triggered"])
    ]);
  }
  const PagesCrawlIndex = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-be3def88"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/crawl/index.vue"]]);
  const _sfc_main$5 = {
    __name: "input",
    setup(__props, { expose: __expose }) {
      __expose();
      const openmaicUrl = vue.ref("");
      const resolveOpenmaicUrl = () => {
        try {
          const url = new URL(getOpenmaicBaseUrl());
          url.pathname = "/";
          url.search = "";
          url.hash = "";
          return url.toString().replace(/\/$/, "");
        } catch (error) {
          return "http://8.135.4.46:3000";
        }
      };
      const goBack = () => {
        uni.reLaunch({ url: "/pages/home/index?openSidebar=1" });
      };
      onLoad(() => {
        openmaicUrl.value = resolveOpenmaicUrl();
      });
      onNavigationBarButtonTap(() => {
        goBack();
      });
      onBackPress((options = {}) => {
        if (options.from === "navigateBack") {
          return false;
        }
        goBack();
        return true;
      });
      const __returned__ = { openmaicUrl, resolveOpenmaicUrl, goBack, ref: vue.ref, get onBackPress() {
        return onBackPress;
      }, get onLoad() {
        return onLoad;
      }, get onNavigationBarButtonTap() {
        return onNavigationBarButtonTap;
      }, get getOpenmaicBaseUrl() {
        return getOpenmaicBaseUrl;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "school-page" }, [
      $setup.openmaicUrl ? (vue.openBlock(), vue.createElementBlock("web-view", {
        key: 0,
        class: "school-webview",
        src: $setup.openmaicUrl
      }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-title" }, "AI 学堂暂时不可用"),
        vue.createElementVNode("text", { class: "empty-copy" }, " 当前没有可用的 OpenMAIC 地址，请先检查服务器和前端访问地址配置。 ")
      ]))
    ]);
  }
  const PagesSchoolInput = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-6684b8ff"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/school/input.vue"]]);
  const _sfc_main$4 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics();
      const topBarOffset = `${statusBarHeight + uni.upx2px(124)}px`;
      const profileScrollStyle = {
        marginTop: topBarOffset,
        height: `calc(100vh - ${topBarOffset})`
      };
      const userStore = useUserStore();
      const companyNewsBaseUrl = DEFAULT_NEWS_BASE_URL;
      const apiBaseUrl = vue.ref(userStore.apiBaseUrl);
      const unifiedApiKey = vue.ref(uni.getStorageSync("unifiedApiKey") || "");
      const localProfile = vue.ref(getLocalProfile());
      const developerPanelVisible = vue.ref(!!(apiBaseUrl.value || unifiedApiKey.value));
      const genderSheetVisible = vue.ref(false);
      const genderOptions = ["未设置", "女", "男"];
      const toastState = vue.ref({
        visible: false,
        message: "",
        type: "success"
      });
      let toastTimer = null;
      const isAuthenticated = vue.computed(() => userStore.isAuthenticated);
      const userInfo = vue.computed(() => {
        if (userStore.userInfo)
          return userStore.userInfo;
        return {
          id: "guest",
          username: "",
          nickname: "灵境用户",
          createdAt: ""
        };
      });
      const displayUsername = vue.computed(() => userInfo.value.username || userInfo.value.id || "后端未提供");
      const displayCreatedAt = vue.computed(() => {
        if (!isAuthenticated.value)
          return "未登录";
        return userInfo.value.createdAt || "后端未提供";
      });
      const mergedProfile = vue.computed(() => ({
        ...localProfile.value,
        nickname: userInfo.value.nickname || localProfile.value.nickname
      }));
      const avatarInitial = vue.computed(() => {
        const source = mergedProfile.value.nickname || displayUsername.value || "灵";
        return String(source).trim().slice(0, 1) || "灵";
      });
      const introDisplay = vue.computed(() => {
        const bio = String(mergedProfile.value.bio || "").trim();
        return bio ? `${bio}  ›` : "介绍一下自己  ›";
      });
      const developerSummary = vue.computed(() => {
        if (apiBaseUrl.value)
          return "已设置 AI工坊 自定义地址";
        if (unifiedApiKey.value)
          return "已写入统一 API 密钥";
        return "展开后可配置 AI工坊 联调地址与密钥";
      });
      const showInlineToast = (message, type = "success", duration = 1800) => {
        if (!message)
          return;
        if (toastTimer) {
          clearTimeout(toastTimer);
          toastTimer = null;
        }
        toastState.value = {
          visible: true,
          message,
          type
        };
        toastTimer = setTimeout(() => {
          toastState.value.visible = false;
          toastTimer = null;
        }, duration);
      };
      const syncProfile = () => {
        localProfile.value = saveLocalProfile({
          nickname: userInfo.value.nickname || getLocalProfile().nickname
        });
      };
      const loadPageData = async () => {
        syncProfile();
      };
      const goBack = () => {
        safeNavigateBack("/pages/home/index?openSidebar=1");
      };
      const openAuth = (mode = "login") => {
        uni.navigateTo({
          url: `/pages/profile/auth?mode=${mode}&redirect=${encodeURIComponent("/pages/profile/index")}`
        });
      };
      const goToNickname = () => {
        uni.navigateTo({ url: "/pages/profile/nickname" });
      };
      const goToBio = () => {
        uni.navigateTo({ url: "/pages/profile/bio" });
      };
      const handleAvatarTap = () => {
        uni.showToast({ title: "头像能力待接入", icon: "none" });
      };
      const toggleDeveloperPanel = () => {
        developerPanelVisible.value = !developerPanelVisible.value;
      };
      const openGenderSheet = () => {
        if (!isAuthenticated.value)
          return;
        genderSheetVisible.value = true;
      };
      const closeGenderSheet = () => {
        genderSheetVisible.value = false;
      };
      const selectGender = (gender) => {
        saveLocalProfile({ gender });
        setProfilePendingToast("性别选项已保存");
        closeGenderSheet();
        syncProfile();
        showInlineToast("性别选项已保存");
      };
      const persistLocalSettings = () => {
        const trimmed = apiBaseUrl.value.trim();
        if (trimmed && !/^https?:\/\/.+/.test(trimmed)) {
          throw new Error("地址格式不正确，需要以 http:// 或 https:// 开头");
        }
        const cleaned = trimmed.replace(/\/+$/, "");
        userStore.setApiBaseUrl(cleaned);
        apiBaseUrl.value = cleaned;
        const nextKey = unifiedApiKey.value.trim();
        if (nextKey) {
          uni.setStorageSync("unifiedApiKey", nextKey);
        } else {
          uni.removeStorageSync("unifiedApiKey");
        }
      };
      const handleSave = async () => {
        try {
          persistLocalSettings();
          await loadPageData();
          showInlineToast("本机设置已保存");
        } catch (error) {
          uni.showToast({ title: error.message || "保存失败", icon: "none" });
        }
      };
      const handleLogout = () => {
        uni.showModal({
          title: "提示",
          content: "确定退出当前账号吗？",
          success: async (res) => {
            if (!res.confirm)
              return;
            try {
              await userStore.logoutRemote();
              showInlineToast("已退出登录");
              setTimeout(() => {
                uni.reLaunch({ url: "/pages/profile/auth" });
              }, 300);
            } catch (error) {
              uni.showToast({ title: error.message || "退出失败", icon: "none" });
            }
          }
        });
      };
      onShow(async () => {
        await loadPageData();
        const toastMessage2 = consumeProfilePendingToast();
        if (toastMessage2) {
          showInlineToast(toastMessage2);
        }
      });
      vue.onBeforeUnmount(() => {
        if (toastTimer) {
          clearTimeout(toastTimer);
          toastTimer = null;
        }
      });
      onBackPress((options = {}) => {
        if (options.from === "navigateBack") {
          return false;
        }
        if (genderSheetVisible.value) {
          closeGenderSheet();
          return true;
        }
        goBack();
        return true;
      });
      const __returned__ = { statusBarHeight, safeAreaInsetsBottom, topBarOffset, profileScrollStyle, userStore, companyNewsBaseUrl, apiBaseUrl, unifiedApiKey, localProfile, developerPanelVisible, genderSheetVisible, genderOptions, toastState, get toastTimer() {
        return toastTimer;
      }, set toastTimer(v) {
        toastTimer = v;
      }, isAuthenticated, userInfo, displayUsername, displayCreatedAt, mergedProfile, avatarInitial, introDisplay, developerSummary, showInlineToast, syncProfile, loadPageData, goBack, openAuth, goToNickname, goToBio, handleAvatarTap, toggleDeveloperPanel, openGenderSheet, closeGenderSheet, selectGender, persistLocalSettings, handleSave, handleLogout, computed: vue.computed, onBeforeUnmount: vue.onBeforeUnmount, ref: vue.ref, get onBackPress() {
        return onBackPress;
      }, get onShow() {
        return onShow;
      }, get useUserStore() {
        return useUserStore;
      }, get DEFAULT_NEWS_BASE_URL() {
        return DEFAULT_NEWS_BASE_URL;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      }, get safeNavigateBack() {
        return safeNavigateBack;
      }, get consumeProfilePendingToast() {
        return consumeProfilePendingToast;
      }, get getLocalProfile() {
        return getLocalProfile;
      }, get saveLocalProfile() {
        return saveLocalProfile;
      }, get setProfilePendingToast() {
        return setProfilePendingToast;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "top-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("view", { class: "page-header" }, [
            vue.createElementVNode("view", {
              class: "header-back",
              onClick: $setup.goBack
            }, [
              vue.createElementVNode("text", { class: "header-back-icon" }, "←")
            ]),
            vue.createElementVNode("text", { class: "header-title" }, "个人信息"),
            vue.createElementVNode("view", { class: "header-placeholder" })
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("scroll-view", {
        class: "profile-scroll",
        style: $setup.profileScrollStyle,
        "scroll-y": ""
      }, [
        vue.createElementVNode(
          "view",
          {
            class: "profile-body",
            style: vue.normalizeStyle({ paddingBottom: `${$setup.safeAreaInsetsBottom + 28}px` })
          },
          [
            vue.createElementVNode("view", { class: "avatar-section" }, [
              vue.createElementVNode("view", { class: "avatar-orb" }, [
                vue.createElementVNode("view", { class: "avatar-highlight" }),
                vue.createElementVNode(
                  "text",
                  { class: "avatar-initial" },
                  vue.toDisplayString($setup.avatarInitial),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "camera-badge",
                onClick: $setup.handleAvatarTap
              }, [
                vue.createElementVNode("text", { class: "camera-badge-text" }, "机")
              ])
            ]),
            $setup.isAuthenticated ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              [
                vue.createElementVNode("view", { class: "info-card" }, [
                  vue.createElementVNode("view", {
                    class: "info-row clickable",
                    onClick: $setup.goToNickname
                  }, [
                    vue.createElementVNode("text", { class: "row-label" }, "昵称"),
                    vue.createElementVNode("view", { class: "row-right" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "row-value" },
                        vue.toDisplayString($setup.mergedProfile.nickname),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "row-arrow" }, "›")
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "divider" }),
                  vue.createElementVNode("view", {
                    class: "info-row clickable",
                    onClick: $setup.openGenderSheet
                  }, [
                    vue.createElementVNode("text", { class: "row-label" }, "性别"),
                    vue.createElementVNode("view", { class: "row-right" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "row-value" },
                        vue.toDisplayString($setup.mergedProfile.gender),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "row-arrow" }, "›")
                    ])
                  ])
                ]),
                vue.createElementVNode("view", {
                  class: "intro-card",
                  onClick: $setup.goToBio
                }, [
                  vue.createElementVNode("text", { class: "intro-title" }, "自我介绍"),
                  vue.createElementVNode(
                    "text",
                    { class: "intro-value" },
                    vue.toDisplayString($setup.introDisplay),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "meta-card" }, [
                  vue.createElementVNode("view", { class: "info-row" }, [
                    vue.createElementVNode("text", { class: "row-label" }, "账号状态"),
                    vue.createElementVNode("text", { class: "row-value" }, "已登录")
                  ]),
                  vue.createElementVNode("view", { class: "divider" }),
                  vue.createElementVNode("view", { class: "info-row" }, [
                    vue.createElementVNode("text", { class: "row-label" }, "用户名"),
                    vue.createElementVNode(
                      "text",
                      { class: "row-value" },
                      vue.toDisplayString($setup.displayUsername),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "divider" }),
                  vue.createElementVNode("view", { class: "info-row" }, [
                    vue.createElementVNode("text", { class: "row-label" }, "注册时间"),
                    vue.createElementVNode(
                      "text",
                      { class: "row-value" },
                      vue.toDisplayString($setup.displayCreatedAt),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "dev-card" }, [
                  vue.createElementVNode("view", {
                    class: "dev-head",
                    onClick: $setup.toggleDeveloperPanel
                  }, [
                    vue.createElementVNode("view", null, [
                      vue.createElementVNode("text", { class: "dev-title" }, "本机联调设置"),
                      vue.createElementVNode(
                        "text",
                        { class: "dev-summary" },
                        vue.toDisplayString($setup.developerSummary),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "dev-arrow" },
                      vue.toDisplayString($setup.developerPanelVisible ? "▾" : "▸"),
                      1
                      /* TEXT */
                    )
                  ]),
                  $setup.developerPanelVisible ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "dev-body"
                  }, [
                    vue.createElementVNode("text", { class: "dev-tip" }, "这里的地址和密钥只保存在当前设备，不会写回公司后端。"),
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        class: "dev-input",
                        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.apiBaseUrl = $event),
                        placeholder: "可选：填写 AI工坊 后端地址",
                        "placeholder-class": "dev-placeholder"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vue.vModelText, $setup.apiBaseUrl]
                    ]),
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        class: "dev-input",
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.unifiedApiKey = $event),
                        placeholder: "可选：统一 API 密钥",
                        "placeholder-class": "dev-placeholder"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vue.vModelText, $setup.unifiedApiKey]
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "dev-tip" },
                      "AI观察哨 当前走公司服务 " + vue.toDisplayString($setup.companyNewsBaseUrl),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "dev-tip" }, "AI学堂 当前通过 OpenMAIC Web 页面承载。"),
                    vue.createElementVNode("view", {
                      class: "dev-save",
                      onClick: $setup.handleSave
                    }, [
                      vue.createElementVNode("text", { class: "dev-save-text" }, "保存本机设置")
                    ])
                  ])) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("view", {
                  class: "logout-button",
                  onClick: $setup.handleLogout
                }, [
                  vue.createElementVNode("text", { class: "logout-text" }, "退出登录")
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 1 },
              [
                vue.createElementVNode("view", { class: "guest-card" }, [
                  vue.createElementVNode("text", { class: "guest-title" }, "尚未登录账号"),
                  vue.createElementVNode("text", { class: "guest-copy" }, "登录后可同步个人身份，并使用公司后端提供的账号态能力。"),
                  vue.createElementVNode("view", {
                    class: "guest-action primary",
                    onClick: _cache[2] || (_cache[2] = ($event) => $setup.openAuth("login"))
                  }, [
                    vue.createElementVNode("text", { class: "guest-action-text dark" }, "登录账号")
                  ]),
                  vue.createElementVNode("view", {
                    class: "guest-action secondary",
                    onClick: _cache[3] || (_cache[3] = ($event) => $setup.openAuth("register"))
                  }, [
                    vue.createElementVNode("text", { class: "guest-action-text light" }, "新用户注册")
                  ])
                ]),
                vue.createElementVNode("view", { class: "meta-card" }, [
                  vue.createElementVNode("view", { class: "info-row" }, [
                    vue.createElementVNode("text", { class: "row-label" }, "账号状态"),
                    vue.createElementVNode("text", { class: "row-value" }, "访客模式")
                  ]),
                  vue.createElementVNode("view", { class: "divider" }),
                  vue.createElementVNode("view", { class: "info-row" }, [
                    vue.createElementVNode("text", { class: "row-label" }, "用户名"),
                    vue.createElementVNode("text", { class: "row-value" }, "未登录")
                  ])
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ],
          4
          /* STYLE */
        )
      ]),
      $setup.genderSheetVisible && $setup.isAuthenticated ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "sheet-mask",
        onClick: $setup.closeGenderSheet
      }, [
        vue.createElementVNode("view", {
          class: "gender-sheet",
          onClick: _cache[4] || (_cache[4] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("text", { class: "sheet-title" }, "性别设置"),
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.genderOptions, (item) => {
              return vue.createElementVNode("view", {
                key: item,
                class: "sheet-option",
                onClick: ($event) => $setup.selectGender(item)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "sheet-option-text" },
                  vue.toDisplayString(item),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.toastState.visible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "floating-toast"
      }, [
        vue.createElementVNode("view", { class: "floating-toast-panel" }, [
          $setup.toastState.type === "success" ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "floating-toast-icon"
          }, "✓")) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "text",
            { class: "floating-toast-text" },
            vue.toDisplayString($setup.toastState.message),
            1
            /* TEXT */
          )
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProfileIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-201c0da5"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/profile/index.vue"]]);
  const _sfc_main$3 = {
    __name: "nickname",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight } = getLayoutMetrics();
      const topBarOffset = `${statusBarHeight + uni.upx2px(124)}px`;
      const formAreaStyle = {
        paddingTop: `calc(${topBarOffset} + 24rpx)`
      };
      const userStore = useUserStore();
      const nickname = vue.ref("");
      const goBack = () => {
        safeNavigateBack("/pages/profile/index");
      };
      const handleSave = async () => {
        const value = nickname.value.trim();
        if (!value) {
          uni.showToast({ title: "请输入昵称", icon: "none" });
          return;
        }
        userStore.setUserInfo({
          ...userStore.userInfo || {},
          nickname: value
        });
        saveLocalProfile({ nickname: value });
        setProfilePendingToast("昵称修改成功");
        safeNavigateBack("/pages/profile/index");
      };
      onLoad(() => {
        var _a;
        nickname.value = ((_a = userStore.userInfo) == null ? void 0 : _a.nickname) || getLocalProfile().nickname;
      });
      onBackPress((options = {}) => {
        if (options.from === "navigateBack") {
          return false;
        }
        goBack();
        return true;
      });
      const __returned__ = { statusBarHeight, topBarOffset, formAreaStyle, userStore, nickname, goBack, handleSave, get onBackPress() {
        return onBackPress;
      }, get onLoad() {
        return onLoad;
      }, ref: vue.ref, get useUserStore() {
        return useUserStore;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      }, get getLocalProfile() {
        return getLocalProfile;
      }, get saveLocalProfile() {
        return saveLocalProfile;
      }, get setProfilePendingToast() {
        return setProfilePendingToast;
      }, get safeNavigateBack() {
        return safeNavigateBack;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "edit-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "top-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("view", { class: "page-header" }, [
            vue.createElementVNode("view", {
              class: "header-side header-back",
              onClick: $setup.goBack
            }, [
              vue.createElementVNode("text", { class: "header-back-icon" }, "←")
            ]),
            vue.createElementVNode("text", { class: "header-title" }, "设置昵称"),
            vue.createElementVNode("view", {
              class: "header-side header-action-done",
              onClick: $setup.handleSave
            }, [
              vue.createElementVNode("text", { class: "header-action-text" }, "完成")
            ])
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", {
        class: "form-area",
        style: $setup.formAreaStyle
      }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "text-input",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.nickname = $event),
            maxlength: "20",
            placeholder: "请输入昵称",
            "placeholder-class": "text-placeholder"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $setup.nickname]
        ])
      ])
    ]);
  }
  const PagesProfileNickname = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-fe5128e0"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/profile/nickname.vue"]]);
  const _sfc_main$2 = {
    __name: "bio",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight } = getLayoutMetrics();
      const topBarOffset = `${statusBarHeight + uni.upx2px(124)}px`;
      const formAreaStyle = {
        paddingTop: `calc(${topBarOffset} + 24rpx)`
      };
      const bio = vue.ref("");
      const goBack = () => {
        safeNavigateBack("/pages/profile/index");
      };
      const handleSave = () => {
        saveLocalProfile({ bio: bio.value.trim() });
        setProfilePendingToast("自我介绍修改成功");
        safeNavigateBack("/pages/profile/index");
      };
      onLoad(() => {
        bio.value = getLocalProfile().bio;
      });
      onBackPress((options = {}) => {
        if (options.from === "navigateBack") {
          return false;
        }
        goBack();
        return true;
      });
      const __returned__ = { statusBarHeight, topBarOffset, formAreaStyle, bio, goBack, handleSave, get onBackPress() {
        return onBackPress;
      }, get onLoad() {
        return onLoad;
      }, ref: vue.ref, get getLayoutMetrics() {
        return getLayoutMetrics;
      }, get getLocalProfile() {
        return getLocalProfile;
      }, get saveLocalProfile() {
        return saveLocalProfile;
      }, get setProfilePendingToast() {
        return setProfilePendingToast;
      }, get safeNavigateBack() {
        return safeNavigateBack;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "edit-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "top-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("view", { class: "page-header" }, [
            vue.createElementVNode("view", {
              class: "header-side header-back",
              onClick: $setup.goBack
            }, [
              vue.createElementVNode("text", { class: "header-back-icon" }, "←")
            ]),
            vue.createElementVNode("text", { class: "header-title" }, "自我介绍"),
            vue.createElementVNode("view", {
              class: "header-side header-action-done",
              onClick: $setup.handleSave
            }, [
              vue.createElementVNode("text", { class: "header-action-text" }, "保存")
            ])
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", {
        class: "form-area",
        style: $setup.formAreaStyle
      }, [
        vue.withDirectives(vue.createElementVNode(
          "textarea",
          {
            class: "text-area",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.bio = $event),
            maxlength: "50",
            placeholder: "请输入不多于 50 字的自我介绍",
            "placeholder-class": "text-placeholder"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $setup.bio]
        ]),
        vue.createElementVNode(
          "text",
          { class: "count-text" },
          vue.toDisplayString($setup.bio.length) + "/50",
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesProfileBio = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-7b992428"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/profile/bio.vue"]]);
  const _sfc_main$1 = {
    __name: "preview",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics();
      const previewUrl = vue.ref("");
      const pageTitle = vue.ref("工坊预览");
      const goBack = () => {
        safeNavigateBack("/pages/home/index?openSidebar=1");
      };
      const isHttpUrl = (url) => /^https?:\/\/.+/i.test(url || "");
      const copyLink = () => {
        if (!previewUrl.value)
          return;
        if (!isHttpUrl(previewUrl.value)) {
          uni.showToast({ title: "预览地址不合法", icon: "none" });
          return;
        }
        uni.setClipboardData({ data: previewUrl.value });
      };
      const openExternal = () => {
        if (!previewUrl.value)
          return;
        if (!isHttpUrl(previewUrl.value)) {
          uni.showToast({ title: "预览地址不合法", icon: "none" });
          return;
        }
        uni.showModal({
          title: "提示",
          content: "将使用系统浏览器打开预览链接，是否继续？",
          success: (res) => {
            if (!res.confirm)
              return;
            plus.runtime.openURL(previewUrl.value);
          }
        });
      };
      onLoad((query) => {
        let url = "";
        let title = "工坊预览";
        try {
          url = decodeURIComponent(query.url || "");
          title = decodeURIComponent(query.title || "工坊预览");
        } catch (e) {
          url = "";
          title = "工坊预览";
        }
        pageTitle.value = title;
        if (url && !isHttpUrl(url)) {
          uni.showToast({ title: "预览地址不合法", icon: "none" });
          previewUrl.value = "";
          return;
        }
        previewUrl.value = url;
      });
      onBackPress((options = {}) => {
        if (options.from === "navigateBack") {
          return false;
        }
        goBack();
        return true;
      });
      const __returned__ = { statusBarHeight, safeAreaInsetsBottom, previewUrl, pageTitle, goBack, isHttpUrl, copyLink, openExternal, get onBackPress() {
        return onBackPress;
      }, get onLoad() {
        return onLoad;
      }, ref: vue.ref, get getLayoutMetrics() {
        return getLayoutMetrics;
      }, get safeNavigateBack() {
        return safeNavigateBack;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "preview-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "top-safe",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        null,
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("text", {
          class: "header-action",
          onClick: $setup.goBack
        }, "‹"),
        vue.createElementVNode(
          "text",
          { class: "header-title" },
          vue.toDisplayString($setup.pageTitle),
          1
          /* TEXT */
        ),
        vue.createElementVNode("text", {
          class: "header-action",
          onClick: $setup.copyLink
        }, "⧉")
      ]),
      $setup.previewUrl ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "webview-wrap"
      }, [
        vue.createElementVNode("web-view", { src: $setup.previewUrl }, null, 8, ["src"])
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-title" }, "暂无可预览页面"),
        vue.createElementVNode("text", { class: "empty-copy" }, " 当前结果没有返回可访问的预览地址，请先检查 Workshop 服务和 OSS 配置。 ")
      ])),
      $setup.previewUrl ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 2,
          class: "fallback-bar",
          style: vue.normalizeStyle({ paddingBottom: `${$setup.safeAreaInsetsBottom + 18}px` })
        },
        [
          vue.createElementVNode("text", { class: "fallback-copy" }, "内嵌预览优先；如打不开可用浏览器兜底"),
          vue.createElementVNode("view", {
            class: "fallback-button",
            onClick: $setup.openExternal
          }, [
            vue.createElementVNode("text", { class: "fallback-button-text" }, "浏览器打开")
          ])
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesWorkshopPreview = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-2ca49518"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/workshop/preview.vue"]]);
  __definePage("pages/profile/auth", PagesProfileAuth);
  __definePage("pages/home/index", PagesHomeIndex);
  __definePage("pages/crawl/index", PagesCrawlIndex);
  __definePage("pages/school/input", PagesSchoolInput);
  __definePage("pages/profile/index", PagesProfileIndex);
  __definePage("pages/profile/nickname", PagesProfileNickname);
  __definePage("pages/profile/bio", PagesProfileBio);
  __definePage("pages/workshop/preview", PagesWorkshopPreview);
  const _sfc_main = {
    onLaunch() {
      setUnauthorizedHandler(() => {
        useUserStore().logout();
        const pages = (getCurrentPages == null ? void 0 : getCurrentPages()) || [];
        const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : "";
        if (normalizeRoute(currentRoute) !== AUTH_ROUTE) {
          redirectToAuth(currentRoute);
        }
      });
      const userStore = useUserStore();
      if (!userStore.isAuthenticated) {
        setTimeout(() => {
          const pages = (getCurrentPages == null ? void 0 : getCurrentPages()) || [];
          const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : "";
          if (normalizeRoute(currentRoute) !== AUTH_ROUTE) {
            redirectToAuth(currentRoute || "/pages/home/index");
          }
        }, 0);
      }
    },
    onShow() {
      const userStore = useUserStore();
      const pages = (getCurrentPages == null ? void 0 : getCurrentPages()) || [];
      const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : "";
      if (!currentRoute) {
        if (!userStore.isAuthenticated) {
          redirectToAuth("/pages/home/index");
        }
        return;
      }
      if (!routeRequiresAuth(currentRoute))
        return;
      if (userStore.isAuthenticated)
        return;
      redirectToAuth(currentRoute);
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    const pinia = createPinia();
    app.use(pinia);
    return { app, pinia };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
