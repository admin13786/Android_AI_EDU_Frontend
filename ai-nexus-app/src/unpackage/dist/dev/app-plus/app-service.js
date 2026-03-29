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
  const ON_UNLOAD = "onUnload";
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
  const onUnload = /* @__PURE__ */ createLifeCycleHook(
    ON_UNLOAD,
    2
    /* HookFlags.PAGE */
  );
  const _imports_0 = "/static/avatar.svg";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const ANIMATION_MS = 220;
  const _sfc_main$e = {
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
        { id: "school", name: "AI学堂", icon: "学", path: "/pages/school/input" },
        { id: "crawl", name: "AI观察哨", icon: "讯", path: "/pages/crawl/index" },
        { id: "workshop", name: "AI工坊", icon: "工", path: "/pages/home/index" }
      ];
      const showWorkshopHistory = vue.computed(
        () => props.activeSection === "workshop" || props.workshopHistory.length > 0
      );
      const handleMenuClick = (item) => {
        if (item.id === "workshop" && props.activeSection === "workshop") {
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
      const __returned__ = { props, emit, ANIMATION_MS, rendered, isClosing, get closeTimer() {
        return closeTimer;
      }, set closeTimer(v) {
        closeTimer = v;
      }, menuItems, showWorkshopHistory, handleMenuClick, startNewConversation, openHistory, goToProfile, requestClose, get touchStartX() {
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
      }, onTouchStart, onTouchMove, onTouchEnd, computed: vue.computed, ref: vue.ref, watch: vue.watch, onUnmounted: vue.onUnmounted };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
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
          vue.createElementVNode("view", { class: "sidebar-inner" }, [
            vue.createElementVNode("view", {
              class: "quick-action",
              onClick: $setup.startNewConversation
            }, [
              vue.createElementVNode("text", { class: "quick-action-icon" }, "+"),
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
                    vue.createElementVNode("view", { class: "menu-item-left" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "menu-icon" },
                        vue.toDisplayString(item.icon),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "menu-label" },
                        vue.toDisplayString(item.name),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "menu-arrow" },
                      vue.toDisplayString(item.id === $props.activeSection ? "•" : "›"),
                      1
                      /* TEXT */
                    )
                  ], 10, ["onClick"]);
                }),
                64
                /* STABLE_FRAGMENT */
              )),
              $setup.showWorkshopHistory ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "history-block"
              }, [
                vue.createElementVNode("view", { class: "history-divider" }),
                vue.createElementVNode("view", { class: "history-group" }, [
                  vue.createElementVNode("text", { class: "history-title" }, "AI工坊历史对话"),
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($props.workshopHistory, (item) => {
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
                  )),
                  !$props.workshopHistory.length ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "history-empty"
                  }, "还没有历史记录")) : vue.createCommentVNode("v-if", true)
                ])
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createElementVNode("view", {
            class: "profile-anchor",
            onClick: $setup.goToProfile
          }, [
            vue.createElementVNode("image", {
              class: "profile-avatar",
              src: _imports_0,
              mode: "aspectFill"
            })
          ])
        ],
        34
        /* CLASS, NEED_HYDRATION */
      )
    ])) : vue.createCommentVNode("v-if", true);
  }
  const Sidebar = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-3801e5de"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/components/Sidebar.vue"]]);
  let unauthorizedHandler = null;
  function setUnauthorizedHandler(fn) {
    unauthorizedHandler = typeof fn === "function" ? fn : null;
  }
  const getBaseUrl = () => {
    const storedBaseUrl = uni.getStorageSync("apiBaseUrl");
    if (storedBaseUrl)
      return storedBaseUrl;
    return "http://10.0.2.2:8000";
  };
  const normalizeError = (statusCode, data) => {
    if (typeof data === "string")
      return data;
    if (data == null ? void 0 : data.detail)
      return data.detail;
    if (data == null ? void 0 : data.message)
      return data.message;
    if (statusCode === 404)
      return "请求的资源不存在";
    if (statusCode >= 500)
      return "服务器开小差了，请稍后再试";
    return "请求失败，请稍后重试";
  };
  const request = (options) => {
    const token = uni.getStorageSync("token");
    const unifiedKey = uni.getStorageSync("unifiedApiKey");
    return new Promise((resolve, reject) => {
      uni.request({
        url: getBaseUrl() + options.url,
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
            try {
              if (unauthorizedHandler)
                unauthorizedHandler();
            } catch (e) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("userInfo");
            }
            uni.reLaunch({ url: "/pages/home/index" });
            reject(new Error("未授权"));
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(normalizeError(res.statusCode, res.data)));
            return;
          }
          resolve(res.data);
        },
        fail: (error) => {
          reject(new Error((error == null ? void 0 : error.errMsg) || "网络请求失败"));
        }
      });
    });
  };
  const getNewsList = (type = "business") => request({ url: `/api/news?type=${type}`, timeout: 18e4 });
  const generateCode = (prompt) => request({
    url: "/api/workshop/generate",
    method: "POST",
    data: { prompt },
    timeout: 6e5
  });
  const createClassroom = (topic) => request({ url: "/api/school/create", method: "POST", data: { topic }, timeout: 18e4 });
  const getClassroomHistory = () => request({ url: "/api/school/history" });
  const getClassroomDetail = (id) => request({ url: `/api/school/${id}`, timeout: 18e4 });
  const sendClassroomMessage = (id, data) => request({ url: `/api/school/${id}/chat`, method: "POST", data, timeout: 18e4 });
  const updateClassroomProgress = (id, data) => request({ url: `/api/school/${id}/progress`, method: "PUT", data });
  const prepareClassroomSceneAudio = (classroomId, sceneId) => request({ url: `/api/school/${classroomId}/scenes/${sceneId}/audio`, method: "POST", timeout: 18e4 });
  const scoreClassroomQuiz = (classroomId, data) => request({
    url: `/api/school/${classroomId}/quiz/score`,
    method: "POST",
    data,
    timeout: 18e4
  });
  const getUserInfo = () => request({ url: "/api/user/info" });
  const updateUserInfo = (data) => request({ url: "/api/user/info", method: "PUT", data });
  const updateApiBaseUrl = (baseUrl) => request({ url: "/api/user/settings", method: "PUT", data: { apiBaseUrl: baseUrl } });
  const ROOT_PAGES = /* @__PURE__ */ new Set([
    "/pages/home/index",
    "/pages/crawl/index",
    "/pages/school/input",
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
  const getLayoutMetrics = () => {
    var _a;
    const systemInfo = uni.getSystemInfoSync();
    return {
      statusBarHeight: systemInfo.statusBarHeight || 0,
      safeAreaInsetsBottom: ((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) ?? 0
    };
  };
  const WORKSHOP_HISTORY_KEY = "workshopHistory";
  const normalizeHistoryItem = (item = {}) => ({
    id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    prompt: item.prompt || "",
    result: item.result || null,
    createdAt: item.createdAt || Date.now()
  });
  const getWorkshopHistory = () => {
    const raw = uni.getStorageSync(WORKSHOP_HISTORY_KEY);
    if (!Array.isArray(raw))
      return [];
    return raw.map((item) => normalizeHistoryItem(item)).sort((a, b) => b.createdAt - a.createdAt);
  };
  const getWorkshopConversation = (id) => {
    if (!id)
      return null;
    return getWorkshopHistory().find((item) => item.id === id) || null;
  };
  const saveWorkshopConversation = (conversation) => {
    const nextConversation = normalizeHistoryItem(conversation);
    const history = getWorkshopHistory().filter((item) => item.id !== nextConversation.id);
    history.unshift(nextConversation);
    uni.setStorageSync(WORKSHOP_HISTORY_KEY, history);
    return nextConversation;
  };
  const loadingText = "正在生成页面并准备在线预览，请稍等片刻。";
  const _sfc_main$d = {
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
      const introText = vue.computed(() => {
        var _a;
        if (!lastPrompt.value) {
          return "我会先理解你的需求，再产出一版可以继续打磨的页面代码。";
        }
        return ((_a = generatedResult.value) == null ? void 0 : _a.summary) || `围绕“${lastPrompt.value}”，我已经整理出页面结构和交互骨架。`;
      });
      const highlights = vue.computed(() => {
        if (loading.value) {
          return ["模型已开始生成应用结构", "结果完成后会自动切换到预览卡片", "如果预览可用，可以直接打开试玩"];
        }
        if (hasPreview.value) {
          return ["已生成可访问的网页地址", "前端将通过 WebView 或浏览器承载运行", "后续可以继续做发布和分享流程"];
        }
        return ["保留核心玩法和页面骨架", "先生成可继续修改的代码结果", "下一步可以接入 WebView 或沙盒预览"];
      });
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
      const handleGenerate = async () => {
        const prompt = userInput.value.trim();
        if (!prompt || loading.value) {
          if (!prompt)
            uni.showToast({ title: "请输入你的需求", icon: "none" });
          return;
        }
        lastPrompt.value = prompt;
        loading.value = true;
        generatedResult.value = null;
        userInput.value = "";
        startLoadingAnimation();
        try {
          const response = await generateCode(prompt);
          generatedResult.value = response.result;
          const savedConversation = saveWorkshopConversation({
            id: currentConversationId.value || `${Date.now()}`,
            prompt,
            result: response.result,
            createdAt: Date.now()
          });
          currentConversationId.value = savedConversation.id;
          syncWorkshopHistory();
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
        syncWorkshopHistory();
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
        syncWorkshopHistory();
      });
      const __returned__ = { systemInfo, statusBarHeight, safeAreaInsetsBottom, sidebarVisible, userInput, loading, generatedResult, lastPrompt, loadingPhase, workshopHistory, currentConversationId, get loadingTimer() {
        return loadingTimer;
      }, set loadingTimer(v) {
        loadingTimer = v;
      }, loadingPhases, chatHeight, hasPreview, loadingText, activeLoadingPhase, introText, highlights, toggleSidebar, closeSidebar, handleNavigate, clearConversation, syncWorkshopHistory, loadConversation, startLoadingAnimation, stopLoadingAnimation, openPreview, handleGenerate, computed: vue.computed, onUnmounted: vue.onUnmounted, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, Sidebar, get generateCode() {
        return generateCode;
      }, get navigateByPath() {
        return navigateByPath;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
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
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "workshop-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "status-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("text", { class: "status-time" }, "11:37"),
          vue.createElementVNode("view", { class: "status-icons" }, [
            vue.createElementVNode("text", { class: "status-glyph" }, "◌"),
            vue.createElementVNode("text", { class: "status-glyph" }, "◎"),
            vue.createElementVNode("text", { class: "status-glyph" }, "▣")
          ])
        ],
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
                    vue.toDisplayString($setup.loading ? "正在生成中" : "应用创建成功"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "ai-text" },
                    vue.toDisplayString($setup.loading ? $setup.loadingText : $setup.introText),
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
                  vue.createElementVNode("view", { class: "idea-card" }, [
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
                  ]),
                  $setup.generatedResult ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
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
      $setup.generatedResult && $setup.hasPreview ? (vue.openBlock(), vue.createElementBlock("view", {
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
            vue.createElementVNode("view", { class: "voice-badge" }, [
              vue.createElementVNode("text", { class: "voice-badge-text" }, "✦")
            ]),
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
  const PagesHomeIndex = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-4978fed5"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/home/index.vue"]]);
  const _sfc_main$c = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight } = getLayoutMetrics();
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
      const __returned__ = { statusBarHeight, activeTab, newsList, loading, refreshing, goBackToWorkshop, switchTab, loadNews, viewDetail, onMounted: vue.onMounted, ref: vue.ref, get getNewsList() {
        return getNewsList;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "news-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "status-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("text", { class: "status-time" }, "9:41"),
          vue.createElementVNode("view", { class: "status-icons" }, [
            vue.createElementVNode("text", { class: "status-glyph" }, "⌁"),
            vue.createElementVNode("text", { class: "status-glyph" }, "◉"),
            vue.createElementVNode("text", { class: "status-glyph" }, "▣")
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("text", {
          class: "header-action",
          onClick: $setup.goBackToWorkshop
        }, "←"),
        vue.createElementVNode("text", { class: "header-title" }, "AI 观察哨"),
        vue.createElementVNode("view", { class: "header-placeholder" })
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
      ]),
      vue.createElementVNode("scroll-view", {
        class: "news-scroll",
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
                      vue.toDisplayString(item.source || "AI资讯"),
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
  const PagesCrawlIndex = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-be3def88"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/crawl/index.vue"]]);
  const _sfc_main$b = {
    __name: "input",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics();
      const topic = vue.ref("");
      const historyList = vue.ref([]);
      const loading = vue.ref(false);
      const goBackToWorkshop = () => {
        uni.reLaunch({ url: "/pages/home/index?openSidebar=1" });
      };
      const loadHistory = async () => {
        try {
          const response = await getClassroomHistory();
          historyList.value = response.list || [];
        } catch (error) {
          historyList.value = [];
        }
      };
      const handleSubmit = async () => {
        const value = topic.value.trim();
        if (!value) {
          uni.showToast({ title: "请输入学习主题", icon: "none" });
          return;
        }
        loading.value = true;
        try {
          const response = await createClassroom(value);
          uni.navigateTo({ url: `/pages/school/role-loading?id=${response.classroomId}&topic=${encodeURIComponent(value)}` });
        } catch (error) {
          uni.showToast({ title: error.message, icon: "none" });
        } finally {
          loading.value = false;
        }
      };
      const goToClassroom = (item) => {
        uni.navigateTo({ url: `/pages/school/classroom?id=${item.id}` });
      };
      vue.onMounted(() => {
        loadHistory();
      });
      onShow(() => {
        loadHistory();
      });
      const __returned__ = { statusBarHeight, safeAreaInsetsBottom, topic, historyList, loading, goBackToWorkshop, loadHistory, handleSubmit, goToClassroom, onMounted: vue.onMounted, ref: vue.ref, get onShow() {
        return onShow;
      }, get createClassroom() {
        return createClassroom;
      }, get getClassroomHistory() {
        return getClassroomHistory;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "school-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "status-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("text", { class: "status-time" }, "9:41"),
          vue.createElementVNode("view", { class: "status-icons" }, [
            vue.createElementVNode("text", { class: "status-glyph" }, "⌁"),
            vue.createElementVNode("text", { class: "status-glyph" }, "◉"),
            vue.createElementVNode("text", { class: "status-glyph" }, "▣")
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("text", {
          class: "header-action",
          onClick: $setup.goBackToWorkshop
        }, "←"),
        vue.createElementVNode("text", { class: "header-title" }, "AI 学堂"),
        vue.createElementVNode("view", { class: "header-placeholder" })
      ]),
      vue.createElementVNode("scroll-view", {
        class: "school-scroll",
        "scroll-y": ""
      }, [
        vue.createElementVNode("view", { class: "hero-section" }, [
          vue.createElementVNode("view", { class: "hero-badge" }),
          vue.createElementVNode("text", { class: "hero-title" }, "OpenMAIC"),
          vue.createElementVNode("text", { class: "hero-copy" }, "多智能体交互式课堂的生成式学习")
        ]),
        vue.createElementVNode("view", { class: "search-bar" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.topic = $event),
              placeholder: "输入你想学的任何内容，例如：提示词工程、RAG、AI Agent...",
              "placeholder-class": "search-placeholder",
              maxlength: "100",
              onConfirm: $setup.handleSubmit
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $setup.topic]
          ])
        ]),
        $setup.historyList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "course-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.historyList, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: item.id,
                class: "course-card",
                onClick: ($event) => $setup.goToClassroom(item)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "course-title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "course-subtitle" },
                  vue.toDisplayString(item.pages || 0) + " 页 · " + vue.toDisplayString(item.date || "最近学习"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "course-tag" }, [
                  vue.createElementVNode("text", { class: "course-tag-text" }, "继续学习")
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-card"
        }, [
          vue.createElementVNode("text", { class: "empty-title" }, "还没有课程记录"),
          vue.createElementVNode("text", { class: "empty-copy" }, "输入一个学习目标，系统会为你生成一节定制化课堂。")
        ]))
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["bottom-action", { disabled: $setup.loading }]),
          style: vue.normalizeStyle({ paddingBottom: $setup.safeAreaInsetsBottom + "px" }),
          onClick: $setup.handleSubmit
        },
        [
          vue.createElementVNode(
            "text",
            { class: "bottom-action-text" },
            vue.toDisplayString($setup.loading ? "正在创建课堂..." : "立即开课"),
            1
            /* TEXT */
          )
        ],
        6
        /* CLASS, STYLE */
      )
    ]);
  }
  const PagesSchoolInput = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-6684b8ff"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/school/input.vue"]]);
  const _sfc_main$a = {
    __name: "role-loading",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight } = getLayoutMetrics();
      const loadingTip = vue.ref("正在根据课程内容生成角色...");
      let firstTimer = null;
      let secondTimer = null;
      let classroomId = "";
      let topic = "";
      const goBack = () => safeNavigateBack("/pages/school/input");
      const clearTimers = () => {
        clearTimeout(firstTimer);
        clearTimeout(secondTimer);
        firstTimer = null;
        secondTimer = null;
      };
      const startFlow = async () => {
        clearTimers();
        loadingTip.value = "正在根据课程内容生成角色...";
        firstTimer = setTimeout(() => {
          loadingTip.value = "正在组织老师、助教和学生代表的人设...";
        }, 900);
        try {
          if (!classroomId) {
            loadingTip.value = "正在创建课堂...";
            const res = await createClassroom(topic);
            classroomId = (res == null ? void 0 : res.classroomId) || "";
          }
          if (!classroomId) {
            throw new Error("课堂创建失败，请稍后重试");
          }
          secondTimer = setTimeout(() => {
            uni.redirectTo({ url: `/pages/school/role-intro?id=${classroomId}&topic=${encodeURIComponent(topic)}` });
          }, 800);
        } catch (error) {
          const msg = (error == null ? void 0 : error.message) || "课堂创建失败，请稍后重试";
          loadingTip.value = msg;
          uni.showToast({ title: msg, icon: "none" });
        }
      };
      onLoad((query) => {
        classroomId = query.id || "";
        try {
          topic = decodeURIComponent(String(query.topic || "")).trim();
        } catch (e) {
          topic = String(query.topic || "").trim();
        }
        if (!topic) {
          loadingTip.value = "缺少课程主题，请返回重试";
          return;
        }
        startFlow();
      });
      onUnload(() => {
        clearTimers();
      });
      const __returned__ = { statusBarHeight, loadingTip, get firstTimer() {
        return firstTimer;
      }, set firstTimer(v) {
        firstTimer = v;
      }, get secondTimer() {
        return secondTimer;
      }, set secondTimer(v) {
        secondTimer = v;
      }, get classroomId() {
        return classroomId;
      }, set classroomId(v) {
        classroomId = v;
      }, get topic() {
        return topic;
      }, set topic(v) {
        topic = v;
      }, goBack, clearTimers, startFlow, get onLoad() {
        return onLoad;
      }, get onUnload() {
        return onUnload;
      }, ref: vue.ref, get getLayoutMetrics() {
        return getLayoutMetrics;
      }, get createClassroom() {
        return createClassroom;
      }, get safeNavigateBack() {
        return safeNavigateBack;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "loading-page" }, [
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
        }, "←"),
        vue.createElementVNode("text", { class: "header-title" }, "生成课堂"),
        vue.createElementVNode("view", { class: "header-placeholder" })
      ]),
      vue.createElementVNode("view", { class: "loading-content" }, [
        vue.createElementVNode("text", { class: "loading-title" }, "生成课堂角色"),
        vue.createElementVNode(
          "text",
          { class: "loading-copy" },
          vue.toDisplayString($setup.loadingTip),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "cards-row" }, [
          vue.createElementVNode("view", { class: "role-card teacher" }, [
            vue.createElementVNode("text", { class: "role-card-text" }, "教师")
          ]),
          vue.createElementVNode("view", { class: "role-card assistant" }, [
            vue.createElementVNode("text", { class: "role-card-text" }, "助教")
          ]),
          vue.createElementVNode("view", { class: "role-card student" }, [
            vue.createElementVNode("text", { class: "role-card-text" }, "学生")
          ])
        ]),
        vue.createElementVNode("text", { class: "loading-foot" }, "AI 智能体工作中...")
      ])
    ]);
  }
  const PagesSchoolRoleLoading = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-2974fbbe"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/school/role-loading.vue"]]);
  const _sfc_main$9 = {
    __name: "role-intro",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight } = getLayoutMetrics();
      const classroom = vue.ref(null);
      let classroomId = "";
      const goBack = () => uni.navigateBack();
      const loadClassroom = async () => {
        try {
          const response = await getClassroomDetail(classroomId);
          classroom.value = response.classroom;
        } catch (error) {
          uni.showToast({ title: error.message, icon: "none" });
        }
      };
      const startGenerate = () => {
        uni.navigateTo({ url: `/pages/school/outline-loading?id=${classroomId}` });
      };
      onLoad((query) => {
        classroomId = query.id || "";
        loadClassroom();
      });
      const __returned__ = { statusBarHeight, classroom, get classroomId() {
        return classroomId;
      }, set classroomId(v) {
        classroomId = v;
      }, goBack, loadClassroom, startGenerate, get onLoad() {
        return onLoad;
      }, ref: vue.ref, get getClassroomDetail() {
        return getClassroomDetail;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "role-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "status-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("text", { class: "status-time" }, "9:41"),
          vue.createElementVNode("view", { class: "status-icons" }, [
            vue.createElementVNode("text", { class: "status-glyph" }, "⌁"),
            vue.createElementVNode("text", { class: "status-glyph" }, "◉"),
            vue.createElementVNode("text", { class: "status-glyph" }, "▣")
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("text", {
          class: "header-action",
          onClick: $setup.goBack
        }, "←"),
        vue.createElementVNode("text", { class: "header-title" }, "课堂角色"),
        vue.createElementVNode("view", { class: "header-placeholder" })
      ]),
      $setup.classroom ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
        key: 0,
        class: "role-scroll",
        "scroll-y": ""
      }, [
        vue.createElementVNode("view", { class: "title-area" }, [
          vue.createElementVNode("text", { class: "big-title" }, "你的课堂角色"),
          vue.createElementVNode("text", { class: "sub-copy" }, "AI 为你生成了专属的学习伙伴")
        ]),
        vue.createElementVNode("view", { class: "cards-area" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.classroom.roles, (role) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: role.id,
                  class: vue.normalizeClass(["role-card", role.id])
                },
                [
                  vue.createElementVNode("view", { class: "role-head" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["role-avatar", role.id])
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          { class: "role-avatar-text" },
                          vue.toDisplayString(role.name.slice(0, 1)),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    ),
                    vue.createElementVNode("view", { class: "role-meta" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "role-type" },
                        vue.toDisplayString(role.type),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "role-name" },
                        vue.toDisplayString(role.name),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "role-desc" },
                    vue.toDisplayString(role.description),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", {
        class: "bottom-button",
        onClick: $setup.startGenerate
      }, [
        vue.createElementVNode("text", { class: "bottom-button-text" }, "继续")
      ])
    ]);
  }
  const PagesSchoolRoleIntro = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-84653446"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/school/role-intro.vue"]]);
  const _sfc_main$8 = {
    __name: "outline-loading",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight } = getLayoutMetrics();
      const loadingTip = vue.ref("正在构建学习路径...");
      let firstTimer = null;
      let secondTimer = null;
      let classroomId = "";
      const goBack = () => safeNavigateBack("/pages/school/input");
      onLoad((query) => {
        classroomId = query.id || "";
        if (!classroomId) {
          loadingTip.value = "缺少课堂 ID，请返回重试";
          uni.showToast({ title: "缺少课堂 ID", icon: "none" });
          return;
        }
        firstTimer = setTimeout(() => {
          loadingTip.value = "正在组织课堂内容和互动消息...";
        }, 900);
        secondTimer = setTimeout(() => {
          uni.redirectTo({ url: `/pages/school/classroom?id=${classroomId}` });
        }, 1600);
      });
      onUnload(() => {
        clearTimeout(firstTimer);
        clearTimeout(secondTimer);
      });
      const __returned__ = { statusBarHeight, loadingTip, get firstTimer() {
        return firstTimer;
      }, set firstTimer(v) {
        firstTimer = v;
      }, get secondTimer() {
        return secondTimer;
      }, set secondTimer(v) {
        secondTimer = v;
      }, get classroomId() {
        return classroomId;
      }, set classroomId(v) {
        classroomId = v;
      }, goBack, get onLoad() {
        return onLoad;
      }, get onUnload() {
        return onUnload;
      }, ref: vue.ref, get getLayoutMetrics() {
        return getLayoutMetrics;
      }, get safeNavigateBack() {
        return safeNavigateBack;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "loading-page" }, [
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
        }, "←"),
        vue.createElementVNode("text", { class: "header-title" }, "生成课堂"),
        vue.createElementVNode("view", { class: "header-placeholder" })
      ]),
      vue.createElementVNode("view", { class: "loading-content" }, [
        vue.createElementVNode("text", { class: "loading-title" }, "生成课程大纲"),
        vue.createElementVNode(
          "text",
          { class: "loading-copy" },
          vue.toDisplayString($setup.loadingTip),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "doc-card" }, [
          vue.createElementVNode("text", { class: "doc-icon" }, "▤"),
          vue.createElementVNode("view", { class: "progress-track" }, [
            vue.createElementVNode("view", { class: "progress-fill" })
          ])
        ]),
        vue.createElementVNode("text", { class: "loading-foot" }, "即将进入课堂")
      ])
    ]);
  }
  const PagesSchoolOutlineLoading = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-c5ad6f9e"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/school/outline-loading.vue"]]);
  const _sfc_main$7 = {
    __name: "WhiteboardPlayer",
    props: {
      whiteboard: {
        type: Object,
        default: () => ({})
      },
      activeElementId: {
        type: String,
        default: ""
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const viewportWidth = vue.computed(() => {
        var _a;
        return Number(((_a = props.whiteboard) == null ? void 0 : _a.viewportSize) || 1e3);
      });
      const viewportHeight = vue.computed(() => {
        var _a, _b;
        return Number(((_a = props.whiteboard) == null ? void 0 : _a.viewportHeight) || viewportWidth.value * Number(((_b = props.whiteboard) == null ? void 0 : _b.viewportRatio) || 0.5625));
      });
      const ratioPercent = vue.computed(() => {
        if (!viewportWidth.value)
          return 56.25;
        return viewportHeight.value / viewportWidth.value * 100;
      });
      const backgroundColor = vue.computed(() => {
        var _a;
        const background = ((_a = props.whiteboard) == null ? void 0 : _a.background) || {};
        return background.color || "#ffffff";
      });
      const percentX = (value) => `${(Number(value || 0) / viewportWidth.value * 100).toFixed(4)}%`;
      const percentY = (value) => `${(Number(value || 0) / viewportHeight.value * 100).toFixed(4)}%`;
      const renderedElements = vue.computed(
        () => {
          var _a;
          return (((_a = props.whiteboard) == null ? void 0 : _a.elements) || []).map((element) => ({
            ...element,
            style: {
              left: percentX(element.left),
              top: percentY(element.top),
              width: percentX(element.width),
              height: percentY(element.height),
              transform: element.rotate ? `rotate(${element.rotate}deg)` : "none"
            }
          }));
        }
      );
      const __returned__ = { props, viewportWidth, viewportHeight, ratioPercent, backgroundColor, percentX, percentY, renderedElements, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "whiteboard-player" }, [
      vue.createElementVNode(
        "view",
        {
          class: "whiteboard-stage",
          style: vue.normalizeStyle({ paddingTop: `${$setup.ratioPercent}%`, background: $setup.backgroundColor })
        },
        [
          vue.createElementVNode("view", { class: "whiteboard-layer" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.renderedElements, (element) => {
                return vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: element.id,
                    class: vue.normalizeClass(["whiteboard-element", [`type-${element.type}`, { active: element.id === $props.activeElementId }]]),
                    style: vue.normalizeStyle(element.style)
                  },
                  [
                    element.type === "text" ? (vue.openBlock(), vue.createElementBlock("rich-text", {
                      key: 0,
                      class: "whiteboard-text",
                      nodes: element.content
                    }, null, 8, ["nodes"])) : (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 1,
                        class: "whiteboard-shape",
                        style: vue.normalizeStyle({ background: element.fill || "#EDE9FE" })
                      },
                      null,
                      4
                      /* STYLE */
                    ))
                  ],
                  6
                  /* CLASS, STYLE */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const WhiteboardPlayer = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-9cb1a4be"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/components/WhiteboardPlayer.vue"]]);
  const _sfc_main$6 = {
    __name: "QuizPlayer",
    props: {
      questions: {
        type: Array,
        required: true
      },
      showResult: {
        type: Boolean,
        default: false
      },
      correctAnswers: {
        type: Object,
        default: () => ({})
      }
    },
    emits: ["submit", "complete"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const userAnswers = vue.reactive({});
      const TYPE_LABELS = { single: "单选", multiple: "多选", short_answer: "简答" };
      const typeLabel = (type) => TYPE_LABELS[type] || type;
      const isChosen = (qId, value) => (userAnswers[qId] || []).includes(value);
      const textOf = (qId) => (userAnswers[qId] || [""])[0] || "";
      const isCorrectAnswer = (qId, value) => (props.correctAnswers[qId] || []).includes(value);
      const isWrongPick = (qId, value) => isChosen(qId, value) && !isCorrectAnswer(qId, value);
      const optionClasses = (q, opt) => {
        const chosen = isChosen(q.id, opt.value);
        if (!props.showResult)
          return { selected: chosen };
        const correct = isCorrectAnswer(q.id, opt.value);
        return {
          selected: chosen,
          "res-correct": chosen && correct,
          "res-wrong": chosen && !correct,
          "res-missed": !chosen && correct
        };
      };
      const maxScore = vue.computed(
        () => props.questions.reduce((s, q) => s + (q.points || 0), 0)
      );
      const totalScore = vue.computed(() => {
        if (!props.showResult)
          return 0;
        return props.questions.reduce((sum, q) => {
          const ca = props.correctAnswers[q.id] || [];
          const ua = userAnswers[q.id] || [];
          if (q.type === "short_answer") {
            return sum + (ca[0] && ua[0] === ca[0] ? q.points || 0 : 0);
          }
          if (!ca.length)
            return sum;
          const match = ca.length === ua.length && ca.every((v) => ua.includes(v));
          return sum + (match ? q.points || 0 : 0);
        }, 0);
      });
      const progressPercent = vue.computed(
        () => maxScore.value ? Math.round(totalScore.value / maxScore.value * 100) : 0
      );
      const answeredCount = vue.computed(
        () => Object.keys(userAnswers).filter((k) => {
          const v = userAnswers[k];
          return v && v.length > 0 && (typeof v[0] !== "string" || v[0].trim() !== "");
        }).length
      );
      const tapOption = (q, opt) => {
        if (props.showResult)
          return;
        if (q.type === "single") {
          userAnswers[q.id] = [opt.value];
        } else if (q.type === "multiple") {
          const arr = userAnswers[q.id] || [];
          userAnswers[q.id] = arr.includes(opt.value) ? arr.filter((v) => v !== opt.value) : [...arr, opt.value];
        }
      };
      const onTextInput = (e, qId) => {
        userAnswers[qId] = [e.detail.value];
      };
      const handleSubmit = () => {
        if (props.showResult) {
          emit("complete");
          return;
        }
        const answers = {};
        props.questions.forEach((q) => {
          answers[q.id] = userAnswers[q.id] || [];
        });
        emit("submit", { answers, score: null });
      };
      const __returned__ = { props, emit, userAnswers, TYPE_LABELS, typeLabel, isChosen, textOf, isCorrectAnswer, isWrongPick, optionClasses, maxScore, totalScore, progressPercent, answeredCount, tapOption, onTextInput, handleSubmit, reactive: vue.reactive, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("scroll-view", {
      class: "quiz-player",
      "scroll-y": ""
    }, [
      vue.createElementVNode("view", { class: "quiz-inner" }, [
        $props.showResult ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "score-panel"
        }, [
          vue.createElementVNode("view", { class: "score-row" }, [
            vue.createElementVNode("view", { class: "score-info" }, [
              vue.createElementVNode("text", { class: "score-title" }, "测验得分"),
              vue.createElementVNode(
                "text",
                { class: "score-detail" },
                "共 " + vue.toDisplayString($props.questions.length) + " 题 · 满分 " + vue.toDisplayString($setup.maxScore) + " 分",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "text",
              { class: "score-value" },
              vue.toDisplayString($setup.totalScore),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "score-track" }, [
            vue.createElementVNode(
              "view",
              {
                class: "score-fill",
                style: vue.normalizeStyle({ width: $setup.progressPercent + "%" })
              },
              null,
              4
              /* STYLE */
            )
          ])
        ])) : vue.createCommentVNode("v-if", true),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($props.questions, (q, idx) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: q.id,
              class: "q-card"
            }, [
              vue.createElementVNode("view", { class: "q-header" }, [
                vue.createElementVNode("view", { class: "q-header-left" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "q-num" },
                    vue.toDisplayString(idx + 1),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["q-badge", `badge-${q.type}`])
                    },
                    [
                      vue.createElementVNode(
                        "text",
                        { class: "q-badge-text" },
                        vue.toDisplayString($setup.typeLabel(q.type)),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  )
                ]),
                q.points ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "q-pts"
                  },
                  vue.toDisplayString(q.points) + " 分",
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode(
                "text",
                { class: "q-body" },
                vue.toDisplayString(q.question),
                1
                /* TEXT */
              ),
              q.type !== "short_answer" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "opt-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(q.options, (opt) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: opt.value,
                      class: vue.normalizeClass(["opt-item", $setup.optionClasses(q, opt)]),
                      onClick: ($event) => $setup.tapOption(q, opt)
                    }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["opt-indicator", q.type === "single" ? "is-radio" : "is-checkbox"])
                        },
                        [
                          $setup.isChosen(q.id, opt.value) ? (vue.openBlock(), vue.createElementBlock("view", {
                            key: 0,
                            class: "indicator-fill"
                          })) : vue.createCommentVNode("v-if", true)
                        ],
                        2
                        /* CLASS */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "opt-text" },
                        vue.toDisplayString(opt.value) + ". " + vue.toDisplayString(opt.label),
                        1
                        /* TEXT */
                      ),
                      $props.showResult && $setup.isCorrectAnswer(q.id, opt.value) ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 0,
                        class: "result-icon icon-correct"
                      }, "✓")) : vue.createCommentVNode("v-if", true),
                      $props.showResult && $setup.isWrongPick(q.id, opt.value) ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 1,
                        class: "result-icon icon-wrong"
                      }, "✗")) : vue.createCommentVNode("v-if", true)
                    ], 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true),
              q.type === "short_answer" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "sa-area"
              }, [
                vue.createElementVNode("textarea", {
                  class: vue.normalizeClass(["sa-input", { "sa-locked": $props.showResult }]),
                  value: $setup.textOf(q.id),
                  placeholder: "请输入你的答案…",
                  "placeholder-style": "color:#64748b;font-size:26rpx",
                  disabled: $props.showResult,
                  "auto-height": "",
                  onInput: ($event) => $setup.onTextInput($event, q.id)
                }, null, 42, ["value", "disabled", "onInput"]),
                $props.showResult && $props.correctAnswers[q.id] ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "sa-ref"
                }, [
                  vue.createElementVNode("text", { class: "sa-ref-label" }, "参考答案"),
                  vue.createElementVNode(
                    "text",
                    { class: "sa-ref-content" },
                    vue.toDisplayString(($props.correctAnswers[q.id] || []).join("")),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ])) : vue.createCommentVNode("v-if", true),
              $props.showResult && q.analysis ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "q-analysis"
              }, [
                vue.createElementVNode("view", { class: "analysis-divider" }),
                vue.createElementVNode("view", { class: "analysis-head" }, [
                  vue.createElementVNode("text", { class: "analysis-tag" }, "解析")
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "analysis-text" },
                  vue.toDisplayString(q.analysis),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        vue.createElementVNode("view", { class: "quiz-foot" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["submit-btn", { "is-result": $props.showResult }]),
              onClick: $setup.handleSubmit
            },
            [
              vue.createElementVNode(
                "text",
                { class: "submit-btn-text" },
                vue.toDisplayString($props.showResult ? "完成测验" : "提交答案"),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          !$props.showResult ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "foot-hint"
            },
            " 已答 " + vue.toDisplayString($setup.answeredCount) + " / " + vue.toDisplayString($props.questions.length) + " 题 ",
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const QuizPlayer = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-f99460f8"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/components/QuizPlayer.vue"]]);
  const MAX_REFRESH_ATTEMPTS = 60;
  const _sfc_main$5 = {
    __name: "classroom",
    setup(__props, { expose: __expose }) {
      __expose();
      const systemInfo = uni.getSystemInfoSync();
      const { safeAreaInsetsBottom, statusBarHeight } = getLayoutMetrics();
      const audioContext = uni.createInnerAudioContext();
      audioContext.autoplay = false;
      audioContext.loop = false;
      const speedOptions = ["1.0", "1.25", "1.5"];
      const isPlaying = vue.ref(false);
      const volumeOn = vue.ref(true);
      const playSpeed = vue.ref("1.0");
      const chatInput = vue.ref("");
      const chatMessages = vue.ref([]);
      const classroom = vue.ref(null);
      const currentStep = vue.ref(0);
      const sending = vue.ref(false);
      const videoError = vue.ref("");
      const failureNoticeShown = vue.ref(false);
      const loadingClassroom = vue.ref(false);
      const audioPreparing = vue.ref(false);
      const audioError = vue.ref("");
      const activeElementId = vue.ref("");
      const activeSubtitle = vue.ref("");
      const currentSegmentIndex = vue.ref(-1);
      const quizShowResult = vue.ref(false);
      const quizCorrectAnswers = vue.ref({});
      let classroomId = "";
      let refreshTimer = null;
      let refreshAttempts = 0;
      const chatHeight = Math.max(
        systemInfo.windowHeight - statusBarHeight - 620 - safeAreaInsetsBottom,
        220
      );
      const currentOutline = vue.computed(() => {
        var _a, _b;
        return ((_b = (_a = classroom.value) == null ? void 0 : _a.outline) == null ? void 0 : _b[currentStep.value]) || null;
      });
      const generationStatus = vue.computed(() => {
        var _a, _b;
        return ((_b = (_a = classroom.value) == null ? void 0 : _a.generation) == null ? void 0 : _b.status) || "";
      });
      const generationFailed = vue.computed(() => generationStatus.value === "failed");
      const generationError = vue.computed(() => {
        var _a, _b;
        return ((_b = (_a = classroom.value) == null ? void 0 : _a.generation) == null ? void 0 : _b.error) || "OpenMAIC 当前不可用，请稍后重试。";
      });
      const isGenerating = vue.computed(() => ["queued", "running"].includes(generationStatus.value));
      const currentVideoUrl = vue.computed(() => {
        var _a, _b;
        return ((_b = (_a = currentOutline.value) == null ? void 0 : _a.video) == null ? void 0 : _b.url) || "";
      });
      const currentAudioSegments = vue.computed(() => {
        var _a, _b;
        return ((_b = (_a = currentOutline.value) == null ? void 0 : _a.audio) == null ? void 0 : _b.segments) || [];
      });
      const sceneHasWhiteboard = vue.computed(
        () => {
          var _a, _b, _c, _d;
          return ((_a = currentOutline.value) == null ? void 0 : _a.sceneType) === "slide" && (((_d = (_c = (_b = currentOutline.value) == null ? void 0 : _b.whiteboard) == null ? void 0 : _c.elements) == null ? void 0 : _d.length) || 0) > 0;
        }
      );
      const sceneIsQuiz = vue.computed(
        () => {
          var _a, _b, _c;
          return ((_a = currentOutline.value) == null ? void 0 : _a.sceneType) === "quiz" && (((_c = (_b = currentOutline.value) == null ? void 0 : _b.questions) == null ? void 0 : _c.length) || 0) > 0;
        }
      );
      const quizQuestions = vue.computed(() => {
        var _a;
        return ((_a = currentOutline.value) == null ? void 0 : _a.questions) || [];
      });
      const sceneAudioReady = vue.computed(
        () => currentAudioSegments.value.length > 0 && currentAudioSegments.value.every((segment) => !!segment.url)
      );
      const currentSubtitle = vue.computed(() => activeSubtitle.value || "");
      const sceneTypeLabel = vue.computed(() => {
        var _a;
        const sceneType = ((_a = currentOutline.value) == null ? void 0 : _a.sceneType) || "slide";
        if (sceneType === "interactive")
          return "互动";
        if (sceneType === "quiz")
          return "测验";
        return "白板课";
      });
      const fallbackMediaTitle = vue.computed(() => {
        var _a;
        if (generationFailed.value)
          return "课堂已回退到文本模式";
        return ((_a = currentOutline.value) == null ? void 0 : _a.sceneType) === "interactive" ? "互动场景待升级" : "课堂内容预览";
      });
      const fallbackMediaCopy = vue.computed(() => {
        var _a, _b, _c;
        if (generationFailed.value)
          return generationError.value;
        if (((_a = currentOutline.value) == null ? void 0 : _a.sceneType) === "interactive") {
          return "这一类场景后续会升级成原生互动播放器，当前先保留概要内容。";
        }
        if (((_b = currentOutline.value) == null ? void 0 : _b.sceneType) === "quiz") {
          return "当前测验题目暂不可用，先浏览课堂概要内容。";
        }
        return ((_c = currentOutline.value) == null ? void 0 : _c.summary) || "当前页没有可播放的白板内容。";
      });
      const outlineBullets = vue.computed(() => {
        var _a, _b, _c;
        const bullets = ((_a = currentOutline.value) == null ? void 0 : _a.bullets) || [];
        if (bullets.length)
          return bullets;
        const summary = (_c = (_b = currentOutline.value) == null ? void 0 : _b.summary) == null ? void 0 : _c.trim();
        if (summary) {
          return [
            summary,
            `围绕“${currentOutline.value.title}”建立完整理解`,
            "结合对话提问，边学边消化"
          ];
        }
        return [
          "拆解核心概念并形成知识结构",
          "结合案例理解每一步的作用",
          "在互动提问里完成巩固"
        ];
      });
      const roleShortName = (role, name) => {
        if (role === "teacher")
          return "师";
        if (role === "assistant")
          return "助";
        if (role === "student")
          return "生";
        if (role === "user")
          return "我";
        return (name || "?").slice(0, 1);
      };
      const applyClassroom = (nextClassroom) => {
        classroom.value = nextClassroom;
        chatMessages.value = (nextClassroom == null ? void 0 : nextClassroom.messages) || [];
        currentStep.value = (nextClassroom == null ? void 0 : nextClassroom.currentStep) || 0;
      };
      const resolveMediaUrl = (url) => {
        if (!url)
          return "";
        if (url.startsWith("http://") || url.startsWith("https://"))
          return url;
        return `${getBaseUrl()}${url}`;
      };
      const stopPlayback = ({ clearState = true } = {}) => {
        isPlaying.value = false;
        try {
          audioContext.stop();
        } catch (error) {
        }
        if (clearState) {
          currentSegmentIndex.value = -1;
          activeElementId.value = "";
          activeSubtitle.value = "";
        }
      };
      const updateAudioRuntimeConfig = () => {
        audioContext.volume = volumeOn.value ? 1 : 0;
        audioContext.playbackRate = Number(playSpeed.value) || 1;
      };
      const handleVideoError = () => {
        videoError.value = "视频加载失败，请检查网络或稍后重试";
      };
      const stopRefreshTimer = () => {
        if (refreshTimer) {
          clearTimeout(refreshTimer);
          refreshTimer = null;
        }
        refreshAttempts = 0;
      };
      const scheduleRefresh = (id, delay = 3e3) => {
        stopRefreshTimer();
        refreshAttempts++;
        if (refreshAttempts > MAX_REFRESH_ATTEMPTS) {
          refreshAttempts = 0;
          uni.showToast({ title: "生成超时，请手动刷新", icon: "none" });
          return;
        }
        refreshTimer = setTimeout(() => {
          loadClassroom(id, { silent: true });
        }, delay);
      };
      const persistCurrentStep = async () => {
        if (!classroomId)
          return;
        try {
          await updateClassroomProgress(classroomId, { currentStep: currentStep.value });
        } catch (error) {
        }
      };
      const playSegmentAt = async (segmentIndex = 0) => {
        const segment = currentAudioSegments.value[segmentIndex];
        if (!segment) {
          stopPlayback();
          return;
        }
        if (!segment.url) {
          audioError.value = "当前页语音尚未准备完成，请稍后重试。";
          stopPlayback({ clearState: false });
          return;
        }
        currentSegmentIndex.value = segmentIndex;
        activeElementId.value = segment.relatedElementId || "";
        activeSubtitle.value = segment.text || "";
        audioError.value = "";
        updateAudioRuntimeConfig();
        audioContext.src = resolveMediaUrl(segment.url);
        isPlaying.value = true;
        try {
          audioContext.play();
        } catch (error) {
          isPlaying.value = false;
          audioError.value = "语音播放失败，请检查网络或稍后重试。";
        }
      };
      const ensureCurrentSceneAudio = async ({ autoplay = false, silent = false } = {}) => {
        var _a, _b, _c, _d, _e;
        const scene = currentOutline.value;
        if (!scene || scene.sceneType !== "slide" || !((_b = (_a = scene.audio) == null ? void 0 : _a.segments) == null ? void 0 : _b.length)) {
          return false;
        }
        if (sceneAudioReady.value) {
          if (autoplay)
            await playSegmentAt(0);
          return true;
        }
        if (audioPreparing.value)
          return false;
        audioPreparing.value = true;
        audioError.value = "";
        try {
          const response = await prepareClassroomSceneAudio(classroomId, scene.id);
          if (response.classroom) {
            applyClassroom(response.classroom);
          }
          if (autoplay && ((_c = currentOutline.value) == null ? void 0 : _c.id) === scene.id) {
            await playSegmentAt(0);
          }
          return !!(((_e = (_d = response.scene) == null ? void 0 : _d.audio) == null ? void 0 : _e.segments) || []).every((segment) => !!segment.url);
        } catch (error) {
          audioError.value = error.message || "语音生成失败，请稍后重试。";
          if (!silent) {
            uni.showToast({ title: audioError.value, icon: "none" });
          }
          return false;
        } finally {
          audioPreparing.value = false;
        }
      };
      const cycleSpeed = () => {
        const currentIndex = speedOptions.indexOf(playSpeed.value);
        playSpeed.value = speedOptions[(currentIndex + 1) % speedOptions.length];
        updateAudioRuntimeConfig();
      };
      const toggleVolume = () => {
        volumeOn.value = !volumeOn.value;
      };
      const handleQuizSubmit = async ({ answers }) => {
        var _a;
        const sid = (_a = currentOutline.value) == null ? void 0 : _a.id;
        if (!classroomId || !sid) {
          uni.showToast({ title: "测验数据不完整", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "批改中…", mask: true });
          const res = await scoreClassroomQuiz(classroomId, { sceneId: sid, answers });
          quizCorrectAnswers.value = res.correctAnswers || {};
          quizShowResult.value = true;
        } catch (error) {
          uni.showToast({ title: error.message || "评分失败", icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const goBack = () => {
        uni.navigateBack();
      };
      const togglePlay = async () => {
        if (isGenerating.value)
          return;
        if (isPlaying.value) {
          audioContext.pause();
          isPlaying.value = false;
          return;
        }
        if (sceneHasWhiteboard.value && currentAudioSegments.value.length) {
          if (!sceneAudioReady.value) {
            const prepared = await ensureCurrentSceneAudio({ autoplay: false });
            if (!prepared)
              return;
          }
          if (currentSegmentIndex.value >= 0 && currentSegmentIndex.value < currentAudioSegments.value.length) {
            updateAudioRuntimeConfig();
            isPlaying.value = true;
            audioContext.play();
            return;
          }
          await playSegmentAt(0);
        } else if (currentVideoUrl.value) {
          uni.showToast({ title: "视频播放请直接操作播放器", icon: "none" });
        } else if (sceneIsQuiz.value) {
          return;
        }
      };
      const changeLesson = async (direction) => {
        var _a, _b, _c;
        if (!((_b = (_a = classroom.value) == null ? void 0 : _a.outline) == null ? void 0 : _b.length))
          return;
        const wasPlaying = isPlaying.value;
        stopPlayback();
        currentStep.value = Math.min(
          Math.max(currentStep.value + direction, 0),
          classroom.value.outline.length - 1
        );
        await persistCurrentStep();
        if (((_c = currentOutline.value) == null ? void 0 : _c.sceneType) === "slide") {
          await ensureCurrentSceneAudio({ autoplay: wasPlaying, silent: true });
        }
      };
      const prevLesson = async () => {
        await changeLesson(-1);
      };
      const nextLesson = async () => {
        await changeLesson(1);
      };
      const sendMessage = async () => {
        if (!chatInput.value.trim() || sending.value || !classroomId)
          return;
        const message = chatInput.value.trim();
        chatInput.value = "";
        sending.value = true;
        try {
          const response = await sendClassroomMessage(classroomId, {
            message,
            currentStep: currentStep.value
          });
          chatMessages.value.push(...response.messages || []);
          if (typeof response.currentStep === "number") {
            currentStep.value = response.currentStep;
          }
        } catch (error) {
          uni.showToast({ title: error.message, icon: "none" });
          chatInput.value = message;
        } finally {
          sending.value = false;
        }
      };
      const loadClassroom = async (id, { silent = false } = {}) => {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!id || loadingClassroom.value)
          return;
        loadingClassroom.value = true;
        try {
          const response = await getClassroomDetail(id);
          applyClassroom(response.classroom);
          if (((_a = response.classroom) == null ? void 0 : _a.source) === "openmaic" && ["queued", "running"].includes((_c = (_b = response.classroom) == null ? void 0 : _b.generation) == null ? void 0 : _c.status)) {
            scheduleRefresh(id);
          } else {
            stopRefreshTimer();
          }
          if (((_e = (_d = response.classroom) == null ? void 0 : _d.generation) == null ? void 0 : _e.status) === "failed" && !failureNoticeShown.value) {
            failureNoticeShown.value = true;
            uni.showToast({ title: "课堂生成失败，已切换文本模式", icon: "none" });
          }
          if (((_f = currentOutline.value) == null ? void 0 : _f.sceneType) === "slide") {
            ensureCurrentSceneAudio({ silent: true });
          }
        } catch (error) {
          if (!silent) {
            uni.showToast({ title: error.message, icon: "none" });
          }
          if (((_g = classroom.value) == null ? void 0 : _g.source) === "openmaic" && isGenerating.value) {
            scheduleRefresh(id, 5e3);
          }
        } finally {
          loadingClassroom.value = false;
        }
      };
      vue.watch(volumeOn, () => {
        updateAudioRuntimeConfig();
      });
      vue.watch(playSpeed, () => {
        updateAudioRuntimeConfig();
      });
      vue.watch(
        () => {
          var _a;
          return (_a = currentOutline.value) == null ? void 0 : _a.id;
        },
        (nextId, prevId) => {
          var _a;
          if (!nextId || nextId === prevId)
            return;
          stopPlayback();
          quizShowResult.value = false;
          quizCorrectAnswers.value = {};
          if (((_a = currentOutline.value) == null ? void 0 : _a.sceneType) === "slide") {
            ensureCurrentSceneAudio({ silent: true });
          }
        }
      );
      audioContext.onEnded(() => {
        if (!isPlaying.value)
          return;
        playSegmentAt(currentSegmentIndex.value + 1);
      });
      audioContext.onError((error) => {
        isPlaying.value = false;
        audioError.value = (error == null ? void 0 : error.errMsg) || "语音播放失败，请稍后重试。";
      });
      onLoad((query) => {
        if (query.id) {
          classroomId = query.id;
          loadClassroom(query.id);
        }
      });
      onShow(() => {
        if (classroomId) {
          loadClassroom(classroomId, { silent: true });
        }
      });
      vue.onUnmounted(() => {
        stopRefreshTimer();
        stopPlayback();
        audioContext.destroy();
      });
      const __returned__ = { systemInfo, safeAreaInsetsBottom, statusBarHeight, audioContext, speedOptions, isPlaying, volumeOn, playSpeed, chatInput, chatMessages, classroom, currentStep, sending, videoError, failureNoticeShown, loadingClassroom, audioPreparing, audioError, activeElementId, activeSubtitle, currentSegmentIndex, quizShowResult, quizCorrectAnswers, get classroomId() {
        return classroomId;
      }, set classroomId(v) {
        classroomId = v;
      }, get refreshTimer() {
        return refreshTimer;
      }, set refreshTimer(v) {
        refreshTimer = v;
      }, get refreshAttempts() {
        return refreshAttempts;
      }, set refreshAttempts(v) {
        refreshAttempts = v;
      }, MAX_REFRESH_ATTEMPTS, chatHeight, currentOutline, generationStatus, generationFailed, generationError, isGenerating, currentVideoUrl, currentAudioSegments, sceneHasWhiteboard, sceneIsQuiz, quizQuestions, sceneAudioReady, currentSubtitle, sceneTypeLabel, fallbackMediaTitle, fallbackMediaCopy, outlineBullets, roleShortName, applyClassroom, resolveMediaUrl, stopPlayback, updateAudioRuntimeConfig, handleVideoError, stopRefreshTimer, scheduleRefresh, persistCurrentStep, playSegmentAt, ensureCurrentSceneAudio, cycleSpeed, toggleVolume, handleQuizSubmit, goBack, togglePlay, changeLesson, prevLesson, nextLesson, sendMessage, loadClassroom, computed: vue.computed, onUnmounted: vue.onUnmounted, ref: vue.ref, watch: vue.watch, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, WhiteboardPlayer, QuizPlayer, get getClassroomDetail() {
        return getClassroomDetail;
      }, get prepareClassroomSceneAudio() {
        return prepareClassroomSceneAudio;
      }, get scoreClassroomQuiz() {
        return scoreClassroomQuiz;
      }, get sendClassroomMessage() {
        return sendClassroomMessage;
      }, get updateClassroomProgress() {
        return updateClassroomProgress;
      }, get getBaseUrl() {
        return getBaseUrl;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b, _c, _d;
    return vue.openBlock(), vue.createElementBlock("view", { class: "classroom-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "status-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("text", { class: "status-time" }, "9:41"),
          vue.createElementVNode("view", { class: "status-icons" }, [
            vue.createElementVNode("text", { class: "status-glyph" }, "⌁"),
            vue.createElementVNode("text", { class: "status-glyph" }, "◉"),
            vue.createElementVNode("text", { class: "status-glyph" }, "▣")
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("text", {
          class: "header-icon",
          onClick: $setup.goBack
        }, "←"),
        vue.createElementVNode(
          "text",
          { class: "header-title" },
          vue.toDisplayString(((_a = $setup.classroom) == null ? void 0 : _a.topic) || "课程主题"),
          1
          /* TEXT */
        ),
        vue.createElementVNode("text", { class: "header-icon" }, "⋯")
      ]),
      vue.createElementVNode("view", { class: "control-bar" }, [
        vue.createElementVNode(
          "text",
          {
            class: "control-label",
            onClick: $setup.toggleVolume
          },
          vue.toDisplayString($setup.volumeOn ? "音量开" : "音量关"),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", {
          class: "speed-pill",
          onClick: $setup.cycleSpeed
        }, [
          vue.createElementVNode(
            "text",
            { class: "speed-text" },
            vue.toDisplayString($setup.playSpeed) + "x",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("text", {
          class: "control-label",
          onClick: $setup.prevLesson
        }, "上一节"),
        vue.createElementVNode("view", {
          class: "play-button",
          onClick: $setup.togglePlay
        }, [
          vue.createElementVNode(
            "text",
            { class: "play-icon" },
            vue.toDisplayString($setup.isPlaying ? "暂停" : "播放"),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("text", {
          class: "control-label",
          onClick: $setup.nextLesson
        }, "下一节")
      ]),
      $setup.isGenerating ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "media-area"
      }, [
        vue.createElementVNode("view", { class: "video-placeholder" }, [
          vue.createElementVNode("view", {
            class: "generation-orbit",
            "aria-hidden": "true"
          }, [
            vue.createElementVNode("view", { class: "orbit-ring" }),
            vue.createElementVNode("view", { class: "orbit-ring orbit-ring-inner" }),
            vue.createElementVNode("view", { class: "orbit-core" }),
            vue.createElementVNode("view", { class: "orbit-dot orbit-dot-a" }),
            vue.createElementVNode("view", { class: "orbit-dot orbit-dot-b" }),
            vue.createElementVNode("view", { class: "orbit-dot orbit-dot-c" })
          ]),
          vue.createElementVNode("text", { class: "video-placeholder-title" }, "课堂生成中…"),
          vue.createElementVNode("text", { class: "video-placeholder-copy" }, "OpenMAIC 正在生成白板课件、讲解脚本和互动内容，请稍等片刻。")
        ])
      ])) : $setup.sceneHasWhiteboard ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "media-area"
      }, [
        vue.createElementVNode("view", { class: "scene-card" }, [
          vue.createVNode($setup["WhiteboardPlayer"], {
            whiteboard: (_b = $setup.currentOutline) == null ? void 0 : _b.whiteboard,
            "active-element-id": $setup.activeElementId
          }, null, 8, ["whiteboard", "active-element-id"])
        ])
      ])) : $setup.sceneIsQuiz ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "media-area quiz-area"
      }, [
        (vue.openBlock(), vue.createBlock($setup["QuizPlayer"], {
          key: (_c = $setup.currentOutline) == null ? void 0 : _c.id,
          questions: $setup.quizQuestions,
          "show-result": $setup.quizShowResult,
          "correct-answers": $setup.quizCorrectAnswers,
          onSubmit: $setup.handleQuizSubmit
        }, null, 8, ["questions", "show-result", "correct-answers"]))
      ])) : $setup.currentVideoUrl ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "media-area"
      }, [
        vue.createElementVNode("video", {
          class: "lesson-video",
          src: $setup.currentVideoUrl,
          autoplay: $setup.isPlaying,
          muted: !$setup.volumeOn,
          "show-mute-btn": true,
          controls: true,
          "play-strategy": 3,
          "object-fit": "contain",
          onError: $setup.handleVideoError
        }, null, 40, ["src", "autoplay", "muted"])
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "media-area"
      }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["video-placeholder", { failed: $setup.generationFailed }])
          },
          [
            vue.createElementVNode(
              "text",
              { class: "video-placeholder-title" },
              vue.toDisplayString($setup.fallbackMediaTitle),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "video-placeholder-copy" },
              vue.toDisplayString($setup.fallbackMediaCopy),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ])),
      $setup.generationFailed ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 5,
        class: "status-card failed"
      }, [
        vue.createElementVNode("text", { class: "status-card-title" }, "已切换到课堂文本模式"),
        vue.createElementVNode(
          "text",
          { class: "status-card-copy" },
          vue.toDisplayString($setup.generationError),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      $setup.audioPreparing ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 6,
        class: "status-card"
      }, [
        vue.createElementVNode("text", { class: "status-card-title" }, "语音准备中"),
        vue.createElementVNode("text", { class: "status-card-copy" }, "正在为当前白板内容生成讲解语音，首次进入这一页会稍慢一些。")
      ])) : $setup.audioError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 7,
        class: "status-card"
      }, [
        vue.createElementVNode("text", { class: "status-card-title" }, "语音提示"),
        vue.createElementVNode(
          "text",
          { class: "status-card-copy" },
          vue.toDisplayString($setup.audioError),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      $setup.currentSubtitle ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 8,
        class: "status-card"
      }, [
        vue.createElementVNode("text", { class: "status-card-title" }, "当前讲解"),
        vue.createElementVNode(
          "text",
          { class: "status-card-copy" },
          vue.toDisplayString($setup.currentSubtitle),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      $setup.videoError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 9,
        class: "status-card"
      }, [
        vue.createElementVNode("text", { class: "status-card-title" }, "视频提示"),
        vue.createElementVNode(
          "text",
          { class: "status-card-copy" },
          vue.toDisplayString($setup.videoError),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "slide-area" }, [
        vue.createElementVNode("view", { class: "slide-card" }, [
          vue.createElementVNode("view", { class: "slide-header" }, [
            vue.createElementVNode(
              "text",
              { class: "slide-card-title" },
              vue.toDisplayString(((_d = $setup.currentOutline) == null ? void 0 : _d.title) || "课程知识点"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "scene-type-tag" },
              vue.toDisplayString($setup.sceneTypeLabel),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "bullet-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.outlineBullets, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: `${$setup.currentStep}-${index}`,
                  class: "bullet-item"
                }, [
                  vue.createElementVNode("text", { class: "bullet-dot" }, "•"),
                  vue.createElementVNode(
                    "text",
                    { class: "bullet-text" },
                    vue.toDisplayString(item),
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "chat-area",
          "scroll-y": "",
          style: vue.normalizeStyle({ height: `${$setup.chatHeight}px` })
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.chatMessages, (msg) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: msg.id,
                  class: vue.normalizeClass(["message-row", msg.role])
                },
                [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["message-avatar", msg.role])
                    },
                    [
                      vue.createElementVNode(
                        "text",
                        { class: "avatar-text" },
                        vue.toDisplayString($setup.roleShortName(msg.role, msg.name)),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ),
                  vue.createElementVNode("view", { class: "message-card" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "message-name" },
                      vue.toDisplayString(msg.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "message-content" },
                      vue.toDisplayString(msg.content),
                      1
                      /* TEXT */
                    )
                  ])
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode(
        "view",
        {
          class: "bottom-bar",
          style: vue.normalizeStyle({ paddingBottom: `${$setup.safeAreaInsetsBottom + 16}px` })
        },
        [
          vue.createElementVNode("view", { class: "avatars-row" }, [
            vue.createElementVNode("view", { class: "role-chip teacher" }),
            vue.createElementVNode("view", { class: "role-chip assistant" }),
            vue.createElementVNode("view", { class: "role-chip student" }),
            vue.createElementVNode("view", { class: "role-chip observer" })
          ]),
          vue.createElementVNode("view", { class: "input-bar" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "chat-input",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.chatInput = $event),
                placeholder: "输入你的想法...",
                "placeholder-class": "chat-input-placeholder",
                "confirm-type": "send",
                onConfirm: $setup.sendMessage
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.chatInput]
            ]),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["send-button", { disabled: $setup.sending }]),
                onClick: $setup.sendMessage
              },
              [
                vue.createElementVNode("text", { class: "send-icon" }, "➤")
              ],
              2
              /* CLASS */
            )
          ])
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const PagesSchoolClassroom = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-f6dcee15"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/school/classroom.vue"]]);
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
  function isPlainObject(o) {
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
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
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
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
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
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
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
  const useUserStore = defineStore("user", () => {
    const token = vue.ref(uni.getStorageSync("token") || "");
    const userInfo = vue.ref(uni.getStorageSync("userInfo") || null);
    const apiBaseUrl = vue.ref(uni.getStorageSync("apiBaseUrl") || "");
    const setToken = (t) => {
      token.value = t;
      if (t) {
        uni.setStorageSync("token", t);
      } else {
        uni.removeStorageSync("token");
      }
    };
    const setUserInfo = (info) => {
      userInfo.value = info;
      if (info) {
        uni.setStorageSync("userInfo", info);
      } else {
        uni.removeStorageSync("userInfo");
      }
    };
    const setApiBaseUrl = (value) => {
      apiBaseUrl.value = value;
      if (value) {
        uni.setStorageSync("apiBaseUrl", value);
      } else {
        uni.removeStorageSync("apiBaseUrl");
      }
    };
    const fetchUserInfo = async () => {
      const response = await getUserInfo();
      const u = response.user;
      setUserInfo(u);
      if (u && Object.prototype.hasOwnProperty.call(u, "apiBaseUrl")) {
        const raw = u.apiBaseUrl;
        if (raw != null) {
          setApiBaseUrl(String(raw).trim());
        }
      }
      return u;
    };
    const logout = () => {
      setToken("");
      setUserInfo(null);
    };
    return {
      token,
      userInfo,
      apiBaseUrl,
      setToken,
      setUserInfo,
      setApiBaseUrl,
      fetchUserInfo,
      logout
    };
  });
  const PROFILE_STORAGE_KEY = "localProfile";
  const PROFILE_TOAST_KEY = "profilePendingToast";
  const DEFAULT_PROFILE = {
    nickname: "灵境体验官",
    gender: "未设置",
    bio: "正在用真机测试 AI 工坊、AI 学堂和 AI 观察哨的整体流程。"
  };
  const getLocalProfile = () => {
    const raw = uni.getStorageSync(PROFILE_STORAGE_KEY);
    if (!raw || typeof raw !== "object") {
      return { ...DEFAULT_PROFILE };
    }
    return {
      ...DEFAULT_PROFILE,
      ...raw
    };
  };
  const saveLocalProfile = (patch = {}) => {
    const nextProfile = {
      ...getLocalProfile(),
      ...patch
    };
    uni.setStorageSync(PROFILE_STORAGE_KEY, nextProfile);
    return nextProfile;
  };
  const setProfilePendingToast = (message) => {
    if (!message)
      return;
    uni.setStorageSync(PROFILE_TOAST_KEY, message);
  };
  const consumeProfilePendingToast = () => {
    const message = uni.getStorageSync(PROFILE_TOAST_KEY);
    if (message) {
      uni.removeStorageSync(PROFILE_TOAST_KEY);
    }
    return message || "";
  };
  const _sfc_main$4 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics();
      const userStore = useUserStore();
      const apiBaseUrl = vue.ref(userStore.apiBaseUrl);
      const unifiedApiKey = vue.ref(uni.getStorageSync("unifiedApiKey") || "");
      const stats = vue.ref({ courses: 0, hours: 0, codes: 1 });
      const localProfile = vue.ref(getLocalProfile());
      const genderSheetVisible = vue.ref(false);
      const genderOptions = ["未设置", "女", "男"];
      const userInfo = vue.computed(() => userStore.userInfo || { id: "10001", nickname: "灵境用户", phone: "138****8888", createdAt: "2026-03-25" });
      const mergedProfile = vue.computed(() => ({
        ...localProfile.value,
        nickname: userInfo.value.nickname || localProfile.value.nickname
      }));
      const goBack = () => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.reLaunch({ url: "/pages/home/index?openSidebar=1" });
        }
      };
      const syncProfile = () => {
        localProfile.value = saveLocalProfile({
          nickname: userInfo.value.nickname || getLocalProfile().nickname
        });
      };
      const goToNickname = () => {
        uni.navigateTo({ url: "/pages/profile/nickname" });
      };
      const goToBio = () => {
        uni.navigateTo({ url: "/pages/profile/bio" });
      };
      const openGenderSheet = () => {
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
        uni.showToast({
          title: "性别选项已保存",
          icon: "success"
        });
      };
      const loadPageData = async () => {
        var _a;
        try {
          const user = await userStore.fetchUserInfo();
          apiBaseUrl.value = user.apiBaseUrl || userStore.apiBaseUrl;
          saveLocalProfile({ nickname: user.nickname || getLocalProfile().nickname });
        } catch (error) {
          saveLocalProfile({ nickname: userInfo.value.nickname });
        }
        try {
          const history = await getClassroomHistory();
          stats.value.courses = ((_a = history.list) == null ? void 0 : _a.length) || 0;
          stats.value.hours = stats.value.courses * 2;
        } catch (error) {
          stats.value.courses = 0;
        }
      };
      const handleSave = async () => {
        try {
          const trimmed = apiBaseUrl.value.trim();
          if (trimmed && !/^https?:\/\/.+/.test(trimmed)) {
            uni.showToast({ title: "地址格式不正确，需以 http:// 或 https:// 开头", icon: "none" });
            return;
          }
          const cleaned = trimmed.replace(/\/+$/, "");
          const tasks = [];
          if (cleaned !== userStore.apiBaseUrl) {
            tasks.push(updateApiBaseUrl(cleaned));
            userStore.setApiBaseUrl(cleaned);
            apiBaseUrl.value = cleaned;
          }
          if (tasks.length) {
            await Promise.all(tasks);
          }
          const nextKey = unifiedApiKey.value.trim();
          const prevKey = uni.getStorageSync("unifiedApiKey") || "";
          if (nextKey !== prevKey) {
            if (nextKey) {
              uni.setStorageSync("unifiedApiKey", nextKey);
            } else {
              uni.removeStorageSync("unifiedApiKey");
            }
          }
          await loadPageData();
          uni.showToast({ title: "保存成功", icon: "success" });
        } catch (error) {
          uni.showToast({ title: error.message, icon: "none" });
        }
      };
      const handleLogout = () => {
        uni.showModal({
          title: "提示",
          content: "确定退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              userStore.logout();
              uni.reLaunch({ url: "/pages/home/index" });
            }
          }
        });
      };
      onShow(async () => {
        await loadPageData();
        syncProfile();
        const toastMessage2 = consumeProfilePendingToast();
        if (toastMessage2) {
          uni.showToast({
            title: toastMessage2,
            icon: "success"
          });
        }
      });
      const __returned__ = { statusBarHeight, safeAreaInsetsBottom, userStore, apiBaseUrl, unifiedApiKey, stats, localProfile, genderSheetVisible, genderOptions, userInfo, mergedProfile, goBack, syncProfile, goToNickname, goToBio, openGenderSheet, closeGenderSheet, selectGender, loadPageData, handleSave, handleLogout, computed: vue.computed, ref: vue.ref, get onShow() {
        return onShow;
      }, get getClassroomHistory() {
        return getClassroomHistory;
      }, get updateApiBaseUrl() {
        return updateApiBaseUrl;
      }, get useUserStore() {
        return useUserStore;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
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
          class: "status-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("text", { class: "status-time" }, "13:10"),
          vue.createElementVNode("view", { class: "status-icons" }, [
            vue.createElementVNode("text", { class: "status-glyph" }, "⌁"),
            vue.createElementVNode("text", { class: "status-glyph" }, "◉"),
            vue.createElementVNode("text", { class: "status-glyph" }, "▣")
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("text", {
          class: "header-action",
          onClick: $setup.goBack
        }, "←"),
        vue.createElementVNode("text", { class: "header-title" }, "个人信息"),
        vue.createElementVNode("view", { class: "header-placeholder" })
      ]),
      vue.createElementVNode("scroll-view", {
        class: "profile-scroll",
        "scroll-y": ""
      }, [
        vue.createElementVNode("view", { class: "avatar-section" }, [
          vue.createElementVNode("image", {
            class: "avatar-image",
            src: _imports_0,
            mode: "aspectFill"
          }),
          vue.createElementVNode(
            "text",
            { class: "profile-name" },
            vue.toDisplayString($setup.mergedProfile.nickname),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "profile-meta" },
            "ID " + vue.toDisplayString($setup.userInfo.id),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode(
          "view",
          {
            class: "content-area",
            style: vue.normalizeStyle({ paddingBottom: $setup.safeAreaInsetsBottom + 14 + "px" })
          },
          [
            vue.createElementVNode("view", { class: "info-card" }, [
              vue.createElementVNode("view", {
                class: "info-row clickable",
                onClick: $setup.goToNickname
              }, [
                vue.createElementVNode("text", { class: "row-label" }, "昵称"),
                vue.createElementVNode(
                  "text",
                  { class: "row-value" },
                  vue.toDisplayString($setup.mergedProfile.nickname),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "divider" }),
              vue.createElementVNode("view", {
                class: "info-row clickable",
                onClick: $setup.openGenderSheet
              }, [
                vue.createElementVNode("text", { class: "row-label" }, "性别"),
                vue.createElementVNode(
                  "text",
                  { class: "row-value" },
                  vue.toDisplayString($setup.mergedProfile.gender),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "divider" }),
              vue.createElementVNode("view", {
                class: "info-row clickable",
                onClick: $setup.goToBio
              }, [
                vue.createElementVNode("text", { class: "row-label" }, "自我介绍"),
                vue.createElementVNode(
                  "text",
                  { class: "row-value multiline" },
                  vue.toDisplayString($setup.mergedProfile.bio),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "info-card" }, [
              vue.createElementVNode("view", { class: "info-row" }, [
                vue.createElementVNode("text", { class: "row-label" }, "手机号"),
                vue.createElementVNode(
                  "text",
                  { class: "row-value" },
                  vue.toDisplayString($setup.userInfo.phone),
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
                  vue.toDisplayString($setup.userInfo.createdAt),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "settings-card" }, [
              vue.createElementVNode("view", { class: "info-row" }, [
                vue.createElementVNode("text", { class: "row-label" }, "后端地址"),
                vue.createElementVNode("text", { class: "row-value compact" }, "联调配置")
              ]),
              vue.createElementVNode("text", { class: "settings-tip" }, "真机调试时可填写局域网地址，例如 http://192.168.1.10:8000。"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "settings-input",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.apiBaseUrl = $event),
                  placeholder: "可选：填写后端地址",
                  "placeholder-class": "row-placeholder"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.apiBaseUrl]
              ]),
              vue.createElementVNode("text", { class: "settings-tip" }, "若服务端设置了 UNIFIED_API_KEY，在此填写相同密钥（仅保存在本机，用于请求头 X-Api-Key）。"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "settings-input",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.unifiedApiKey = $event),
                  placeholder: "可选：统一 API 密钥",
                  "placeholder-class": "row-placeholder"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.unifiedApiKey]
              ])
            ]),
            vue.createElementVNode("view", { class: "stats-grid" }, [
              vue.createElementVNode("view", { class: "stat-card" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-number" },
                  vue.toDisplayString($setup.stats.courses),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "课堂数")
              ]),
              vue.createElementVNode("view", { class: "stat-card" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-number" },
                  vue.toDisplayString($setup.stats.hours),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "学习时长")
              ]),
              vue.createElementVNode("view", { class: "stat-card" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-number" },
                  vue.toDisplayString($setup.stats.codes),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "生成次数")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "action-button primary",
              onClick: $setup.handleSave
            }, [
              vue.createElementVNode("text", { class: "action-text" }, "保存资料")
            ]),
            vue.createElementVNode("view", {
              class: "action-button danger",
              onClick: $setup.handleLogout
            }, [
              vue.createElementVNode("text", { class: "danger-text" }, "退出登录")
            ])
          ],
          4
          /* STYLE */
        )
      ]),
      $setup.genderSheetVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "sheet-mask",
        onClick: $setup.closeGenderSheet
      }, [
        vue.createElementVNode("view", {
          class: "gender-sheet",
          onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
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
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProfileIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-201c0da5"], ["__file", "D:/Cording_V1.0/AI EDU/Frontend/ai-nexus-app/src/pages/profile/index.vue"]]);
  const _sfc_main$3 = {
    __name: "nickname",
    setup(__props, { expose: __expose }) {
      __expose();
      const { statusBarHeight } = getLayoutMetrics();
      const userStore = useUserStore();
      const nickname = vue.ref("");
      const goBack = () => {
        uni.navigateBack();
      };
      const handleSave = async () => {
        const value = nickname.value.trim();
        if (!value) {
          uni.showToast({ title: "请输入昵称", icon: "none" });
          return;
        }
        try {
          await updateUserInfo({ nickname: value });
          userStore.setUserInfo({
            ...userStore.userInfo || {},
            nickname: value
          });
          saveLocalProfile({ nickname: value });
          setProfilePendingToast("昵称修改成功");
          uni.navigateBack();
        } catch (error) {
          uni.showToast({ title: error.message, icon: "none" });
        }
      };
      onLoad(() => {
        var _a;
        nickname.value = ((_a = userStore.userInfo) == null ? void 0 : _a.nickname) || getLocalProfile().nickname;
      });
      const __returned__ = { statusBarHeight, userStore, nickname, goBack, handleSave, get onLoad() {
        return onLoad;
      }, ref: vue.ref, get updateUserInfo() {
        return updateUserInfo;
      }, get useUserStore() {
        return useUserStore;
      }, get getLayoutMetrics() {
        return getLayoutMetrics;
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
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "edit-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: "status-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("text", { class: "status-time" }, "13:10"),
          vue.createElementVNode("view", { class: "status-icons" }, [
            vue.createElementVNode("text", { class: "status-glyph" }, "◦"),
            vue.createElementVNode("text", { class: "status-glyph" }, "◦"),
            vue.createElementVNode("text", { class: "status-glyph" }, "▮")
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("text", {
          class: "header-action",
          onClick: $setup.goBack
        }, "←"),
        vue.createElementVNode("text", { class: "header-title" }, "设置昵称"),
        vue.createElementVNode("text", {
          class: "header-action done",
          onClick: $setup.handleSave
        }, "完成")
      ]),
      vue.createElementVNode("view", { class: "form-area" }, [
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
      const __returned__ = { statusBarHeight, bio, goBack, handleSave, get onLoad() {
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
        }, "←"),
        vue.createElementVNode("text", { class: "header-title" }, "自我介绍"),
        vue.createElementVNode("text", {
          class: "header-action done",
          onClick: $setup.handleSave
        }, "保存")
      ]),
      vue.createElementVNode("view", { class: "form-area" }, [
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
        uni.navigateBack();
      };
      const openExternal = () => {
        if (!previewUrl.value)
          return;
        plus.runtime.openURL(previewUrl.value);
      };
      onLoad((query) => {
        previewUrl.value = decodeURIComponent(query.url || "");
        pageTitle.value = decodeURIComponent(query.title || "工坊预览");
      });
      const __returned__ = { statusBarHeight, safeAreaInsetsBottom, previewUrl, pageTitle, goBack, openExternal, get onLoad() {
        return onLoad;
      }, ref: vue.ref, get getLayoutMetrics() {
        return getLayoutMetrics;
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
          class: "status-bar",
          style: vue.normalizeStyle({ paddingTop: `${$setup.statusBarHeight}px` })
        },
        [
          vue.createElementVNode("text", { class: "status-time" }, "11:37"),
          vue.createElementVNode("view", { class: "status-icons" }, [
            vue.createElementVNode("text", { class: "status-glyph" }, "◌"),
            vue.createElementVNode("text", { class: "status-glyph" }, "◎"),
            vue.createElementVNode("text", { class: "status-glyph" }, "▣")
          ])
        ],
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
          onClick: $setup.openExternal
        }, "↗")
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
          vue.createElementVNode("text", { class: "fallback-copy" }, "如果内嵌预览打不开，可切换浏览器兜底"),
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
  __definePage("pages/home/index", PagesHomeIndex);
  __definePage("pages/crawl/index", PagesCrawlIndex);
  __definePage("pages/school/input", PagesSchoolInput);
  __definePage("pages/school/role-loading", PagesSchoolRoleLoading);
  __definePage("pages/school/role-intro", PagesSchoolRoleIntro);
  __definePage("pages/school/outline-loading", PagesSchoolOutlineLoading);
  __definePage("pages/school/classroom", PagesSchoolClassroom);
  __definePage("pages/profile/index", PagesProfileIndex);
  __definePage("pages/profile/nickname", PagesProfileNickname);
  __definePage("pages/profile/bio", PagesProfileBio);
  __definePage("pages/workshop/preview", PagesWorkshopPreview);
  const _sfc_main = {
    onLaunch() {
      setUnauthorizedHandler(() => {
        useUserStore().logout();
      });
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
