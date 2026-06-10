const DB_NAME = "kindergarten-english-cards";
const DB_VERSION = 1;
const STORE_NAME = "cards";
const DEFAULT_GROUP = "默认";
const ACCENT_STORAGE_KEY = "kindergarten-english-accent-v4";
const VOICE_STORAGE_KEY = "kindergarten-english-voice-v4";
const RATE_STORAGE_KEY = "kindergarten-speech-rate-v3";
const CLEAR_SPEECH_STORAGE_KEY = "kindergarten-clear-speech-v1";
const CURRENT_GROUP_STORAGE_KEY = "kindergarten-current-group-v1";

const WORD_DICTIONARY = {
  apple: "苹果",
  banana: "香蕉",
  orange: "橙子",
  pear: "梨",
  peach: "桃子",
  grape: "葡萄",
  watermelon: "西瓜",
  strawberry: "草莓",
  lemon: "柠檬",
  mango: "芒果",
  pineapple: "菠萝",
  cherry: "樱桃",
  dog: "狗",
  cat: "猫",
  bird: "鸟",
  fish: "鱼",
  rabbit: "兔子",
  duck: "鸭子",
  chicken: "鸡",
  cow: "奶牛",
  pig: "猪",
  sheep: "羊",
  horse: "马",
  elephant: "大象",
  tiger: "老虎",
  lion: "狮子",
  monkey: "猴子",
  bear: "熊",
  panda: "熊猫",
  giraffe: "长颈鹿",
  zebra: "斑马",
  frog: "青蛙",
  turtle: "乌龟",
  bee: "蜜蜂",
  butterfly: "蝴蝶",
  ant: "蚂蚁",
  red: "红色",
  blue: "蓝色",
  yellow: "黄色",
  green: "绿色",
  black: "黑色",
  white: "白色",
  pink: "粉色",
  purple: "紫色",
  brown: "棕色",
  gray: "灰色",
  one: "一",
  two: "二",
  three: "三",
  four: "四",
  five: "五",
  six: "六",
  seven: "七",
  eight: "八",
  nine: "九",
  ten: "十",
  circle: "圆形",
  square: "正方形",
  triangle: "三角形",
  star: "星星",
  heart: "爱心",
  book: "书",
  pen: "钢笔",
  pencil: "铅笔",
  bag: "书包",
  chair: "椅子",
  table: "桌子",
  desk: "课桌",
  ruler: "尺子",
  crayon: "蜡笔",
  eraser: "橡皮",
  ball: "球",
  toy: "玩具",
  car: "汽车",
  bus: "公交车",
  train: "火车",
  bike: "自行车",
  boat: "船",
  plane: "飞机",
  sun: "太阳",
  moon: "月亮",
  cloud: "云",
  rain: "雨",
  snow: "雪",
  wind: "风",
  flower: "花",
  tree: "树",
  grass: "草",
  leaf: "叶子",
  house: "房子",
  home: "家",
  school: "学校",
  park: "公园",
  baby: "宝宝",
  boy: "男孩",
  girl: "女孩",
  father: "爸爸",
  mother: "妈妈",
  brother: "哥哥",
  sister: "姐姐",
  teacher: "老师",
  friend: "朋友",
  eye: "眼睛",
  ear: "耳朵",
  nose: "鼻子",
  mouth: "嘴巴",
  hand: "手",
  foot: "脚",
  head: "头",
  arm: "胳膊",
  leg: "腿",
  happy: "开心",
  sad: "难过",
  angry: "生气",
  hungry: "饿了",
  thirsty: "渴了",
  big: "大的",
  small: "小的",
  long: "长的",
  short: "短的",
  hot: "热的",
  cold: "冷的",
  up: "上",
  down: "下",
  in: "里面",
  out: "外面",
  open: "打开",
  close: "关闭",
  run: "跑",
  jump: "跳",
  walk: "走",
  swim: "游泳",
  eat: "吃",
  drink: "喝",
  sleep: "睡觉",
  sing: "唱歌",
  dance: "跳舞",
  read: "读",
  write: "写",
};

const state = {
  cards: [],
  currentIndex: 0,
  currentGroup: "all",
  pendingImage: "",
  db: null,
  storageReady: true,
  isRecognizing: false,
  isTestMode: false,
  testCards: [],
  testIndex: 0,
};

function getLocalCards() {
  const groups = Array.isArray(window.LOCAL_CARD_GROUPS) ? window.LOCAL_CARD_GROUPS : [];
  const cards = [];

  groups.forEach((groupEntry, groupIndex) => {
    const group = normalizeGroup(String(groupEntry.group || DEFAULT_GROUP));
    const groupCards = Array.isArray(groupEntry.cards) ? groupEntry.cards : [];

    groupCards.forEach((cardEntry, cardIndex) => {
      const english = String(cardEntry.english || "").trim();
      const image = String(cardEntry.image || "").trim();
      if (!english || !image) {
        return;
      }

      cards.push({
        id: `local:${groupIndex}:${cardIndex}:${english}:${image}`,
        english,
        chinese: String(cardEntry.chinese || translateFromDictionary(english) || "").trim() || "未翻译",
        group,
        image,
        createdAt: -1000000 + groupIndex * 1000 + cardIndex,
        source: "local",
      });
    });
  });

  return cards;
}

const elements = {
  cardImage: document.getElementById("cardImage"),
  emptyIllustration: document.getElementById("emptyIllustration"),
  englishWord: document.getElementById("englishWord"),
  chineseWord: document.getElementById("chineseWord"),
  cardCount: document.getElementById("cardCount"),
  previousButton: document.getElementById("previousButton"),
  nextButton: document.getElementById("nextButton"),
  speakEnglishButton: document.getElementById("speakEnglishButton"),
  speakChineseButton: document.getElementById("speakChineseButton"),
  englishAccentSelect: document.getElementById("englishAccentSelect"),
  englishVoiceSelect: document.getElementById("englishVoiceSelect"),
  speechRateInput: document.getElementById("speechRateInput"),
  speechRateValue: document.getElementById("speechRateValue"),
  clearSpeechInput: document.getElementById("clearSpeechInput"),
  openTestButton: document.getElementById("openTestButton"),
  testOverlay: document.getElementById("testOverlay"),
  closeTestButton: document.getElementById("closeTestButton"),
  testStatus: document.getElementById("testStatus"),
  testPreviousButton: document.getElementById("testPreviousButton"),
  testNextButton: document.getElementById("testNextButton"),
  testSpeakEnglishButton: document.getElementById("testSpeakEnglishButton"),
  testSpeakChineseButton: document.getElementById("testSpeakChineseButton"),
  testCardImage: document.getElementById("testCardImage"),
  testEmptyIllustration: document.getElementById("testEmptyIllustration"),
  testCardCount: document.getElementById("testCardCount"),
  testEnglishWord: document.getElementById("testEnglishWord"),
  testChineseWord: document.getElementById("testChineseWord"),
  settingsButton: document.getElementById("settingsButton"),
  closeSettingsButton: document.getElementById("closeSettingsButton"),
  settingsPanel: document.getElementById("settingsPanel"),
  clearButton: document.getElementById("clearButton"),
  cardForm: document.getElementById("cardForm"),
  photoInput: document.getElementById("photoInput"),
  groupInput: document.getElementById("groupInput"),
  groupFilter: document.getElementById("groupFilter"),
  groupOptions: document.getElementById("groupOptions"),
  englishInput: document.getElementById("englishInput"),
  chineseInput: document.getElementById("chineseInput"),
  uploadHint: document.getElementById("uploadHint"),
  recognitionStatus: document.getElementById("recognitionStatus"),
  cardList: document.getElementById("cardList"),
  listTotal: document.getElementById("listTotal"),
};

function normalizeGroup(value) {
  return value.trim().replace(/\s+/g, " ") || DEFAULT_GROUP;
}

function getGroups() {
  const groups = new Set(state.cards.map((card) => normalizeGroup(card.group || DEFAULT_GROUP)));
  return [...groups].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function saveCurrentGroup() {
  localStorage.setItem(CURRENT_GROUP_STORAGE_KEY, state.currentGroup);
}

function loadCurrentGroup() {
  const savedGroup = localStorage.getItem(CURRENT_GROUP_STORAGE_KEY);
  if (savedGroup) {
    state.currentGroup = savedGroup;
  }
}

function getVisibleCards() {
  if (state.currentGroup === "all") {
    return state.cards;
  }

  return state.cards.filter((card) => normalizeGroup(card.group || DEFAULT_GROUP) === state.currentGroup);
}

function getCurrentCard() {
  return getVisibleCards()[state.currentIndex];
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("当前浏览器不支持 IndexedDB"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    });

    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

function getStore(mode = "readonly") {
  return state.db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

function loadCards() {
  return new Promise((resolve, reject) => {
    const request = getStore().getAll();

    request.addEventListener("success", () => {
      const savedCards = request.result.map((card) => ({
        ...card,
        group: normalizeGroup(card.group || DEFAULT_GROUP),
        source: card.source || "user",
      }));

      state.cards = [...getLocalCards(), ...savedCards]
        .sort((a, b) => a.createdAt - b.createdAt);
      resolve();
    });
    request.addEventListener("error", () => reject(request.error));
  });
}

function saveCard(card) {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").put(card);

    request.addEventListener("success", () => resolve());
    request.addEventListener("error", () => reject(request.error));
  });
}

function removeCard(id) {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").delete(id);

    request.addEventListener("success", () => resolve());
    request.addEventListener("error", () => reject(request.error));
  });
}

function removeAllCards() {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").clear();

    request.addEventListener("success", () => resolve());
    request.addEventListener("error", () => reject(request.error));
  });
}

function clampCurrentIndex() {
  const visibleCards = getVisibleCards();

  if (visibleCards.length === 0) {
    state.currentIndex = 0;
    return;
  }

  state.currentIndex = Math.min(Math.max(state.currentIndex, 0), visibleCards.length - 1);
}

function renderGroupControls() {
  const groups = getGroups();
  const selectedExists = state.currentGroup === "all" || groups.includes(state.currentGroup);

  if (!selectedExists) {
    state.currentGroup = "all";
    state.currentIndex = 0;
    saveCurrentGroup();
  }

  elements.groupFilter.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = `全部 (${state.cards.length})`;
  elements.groupFilter.append(allOption);

  groups.forEach((group) => {
    const option = document.createElement("option");
    const count = state.cards.filter((card) => normalizeGroup(card.group || DEFAULT_GROUP) === group).length;
    option.value = group;
    option.textContent = `${group} (${count})`;
    elements.groupFilter.append(option);
  });

  elements.groupFilter.value = state.currentGroup;
  elements.groupOptions.replaceChildren(
    ...groups.map((group) => {
      const option = document.createElement("option");
      option.value = group;
      return option;
    }),
  );
}

function getCardsForTestRange(range) {
  if (range === "all") {
    return state.cards;
  }

  return state.cards.filter((card) => normalizeGroup(card.group || DEFAULT_GROUP) === range);
}

function shuffleCards(cards) {
  const result = [...cards];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function renderTestControls() {
  const currentGroupLabel = state.currentGroup === "all" ? "全部" : state.currentGroup;
  elements.testStatus.textContent = state.isTestMode
    ? `${currentGroupLabel} · ${state.testCards.length} 张`
    : `${currentGroupLabel} · 0 张`;
  renderTestCard();
}

function render() {
  renderGroupControls();
  renderTestControls();
  clampCurrentIndex();

  const visibleCards = getVisibleCards();
  const card = getCurrentCard();
  const hasCards = Boolean(card);

  elements.cardCount.textContent = hasCards ? `${state.currentIndex + 1} / ${visibleCards.length}` : "0 / 0";
  elements.englishWord.textContent = hasCards ? card.english : "先添加一张卡片";
  elements.chineseWord.textContent = hasCards ? card.chinese : "拍照上传图片，会自动识别英文";

  if (hasCards) {
    elements.cardImage.src = card.image;
    elements.cardImage.alt = `${card.english}，${card.chinese}`;
    elements.cardImage.hidden = false;
    elements.emptyIllustration.hidden = true;
  } else {
    elements.cardImage.removeAttribute("src");
    elements.cardImage.alt = "";
    elements.cardImage.hidden = true;
    elements.emptyIllustration.hidden = false;
  }

  elements.previousButton.disabled = visibleCards.length < 2;
  elements.nextButton.disabled = visibleCards.length < 2;
  elements.speakEnglishButton.disabled = !hasCards;
  elements.speakChineseButton.disabled = !hasCards;
  elements.clearButton.disabled = !state.cards.some((cardItem) => cardItem.source !== "local");
  elements.clearButton.textContent = "清空上传";
  elements.photoInput.disabled = !state.storageReady || state.isRecognizing;
  elements.groupInput.disabled = !state.storageReady;
  elements.englishInput.disabled = !state.storageReady;
  elements.chineseInput.disabled = !state.storageReady;
  elements.englishAccentSelect.disabled = false;
  elements.englishVoiceSelect.disabled = false;
  elements.speechRateInput.disabled = false;
  elements.clearSpeechInput.disabled = false;
  elements.groupFilter.disabled = state.cards.length === 0;
  elements.cardForm.querySelector("button[type='submit']").disabled = !state.storageReady || state.isRecognizing;
  elements.listTotal.textContent =
    state.currentGroup === "all" ? `${state.cards.length} 张` : `${visibleCards.length} / ${state.cards.length} 张`;

  renderList(visibleCards);
}

function renderList(visibleCards) {
  elements.cardList.replaceChildren();

  if (visibleCards.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-list";
    empty.textContent = state.cards.length === 0 ? "还没有卡片" : "当前分组还没有卡片";
    elements.cardList.append(empty);
    return;
  }

  visibleCards.forEach((card, index) => {
    const item = document.createElement("article");
    item.className = `list-item${index === state.currentIndex ? " active" : ""}`;

    const thumbnail = document.createElement("img");
    thumbnail.src = card.image;
    thumbnail.alt = "";

    const text = document.createElement("button");
    text.type = "button";
    text.className = "list-text";
    text.addEventListener("click", () => {
      state.currentIndex = index;
      render();
    });

    const english = document.createElement("strong");
    english.textContent = card.english;

    const chinese = document.createElement("span");
    chinese.textContent = `${card.chinese} · ${normalizeGroup(card.group || DEFAULT_GROUP)}${
      card.source === "local" ? " · 本地" : ""
    }`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    if (card.source === "local") {
      deleteButton.disabled = true;
      deleteButton.setAttribute("aria-label", `${card.english} 是本地资源`);
      deleteButton.title = "本地资源";
      deleteButton.textContent = "本";
    } else {
      deleteButton.setAttribute("aria-label", `删除 ${card.english}`);
      deleteButton.title = "删除";
      deleteButton.textContent = "×";
      deleteButton.addEventListener("click", () => deleteCard(card.id));
    }

    text.append(english, chinese);
    item.append(thumbnail, text, deleteButton);
    elements.cardList.append(item);
  });
}

function moveCard(direction) {
  const visibleCards = getVisibleCards();
  if (visibleCards.length < 2) {
    return;
  }

  state.currentIndex = (state.currentIndex + direction + visibleCards.length) % visibleCards.length;
  render();
}

function getCurrentTestCard() {
  return state.testCards[state.testIndex];
}

function renderTestCard() {
  const card = getCurrentTestCard();
  const hasCard = Boolean(card);

  elements.testCardCount.textContent = hasCard ? `${state.testIndex + 1} / ${state.testCards.length}` : "0 / 0";
  elements.testEnglishWord.textContent = hasCard ? card.english : "暂无卡片";
  elements.testChineseWord.textContent = hasCard ? card.chinese : "请先选择有卡片的分组";

  if (hasCard) {
    elements.testCardImage.src = card.image;
    elements.testCardImage.alt = `${card.english}，${card.chinese}`;
    elements.testCardImage.hidden = false;
    elements.testEmptyIllustration.hidden = true;
  } else {
    elements.testCardImage.removeAttribute("src");
    elements.testCardImage.alt = "";
    elements.testCardImage.hidden = true;
    elements.testEmptyIllustration.hidden = false;
  }

  const canMove = state.testCards.length > 1;
  elements.testPreviousButton.disabled = !canMove;
  elements.testNextButton.disabled = !canMove;
  elements.testSpeakEnglishButton.disabled = !hasCard;
  elements.testSpeakChineseButton.disabled = !hasCard;
}

function moveTestCard(direction) {
  if (state.testCards.length < 2) {
    return;
  }

  state.testIndex = (state.testIndex + direction + state.testCards.length) % state.testCards.length;
  renderTestCard();
}

function getVoices() {
  return window.speechSynthesis?.getVoices?.() ?? [];
}

function scoreVoice(voice, lang) {
  const name = voice.name.toLowerCase();
  let score = 0;

  if (voice.lang.toLowerCase() === lang.toLowerCase()) {
    score += 80;
  } else if (voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())) {
    score += 30;
  } else {
    return -1;
  }

  if (/natural|premium|enhanced|online/.test(name)) score += 24;
  if (/google|microsoft|apple/.test(name)) score += 18;
  if (/aria|jenny|guy|samantha|daniel|serena|libby|susan|karen|ava|emma|brian|ryan|sonia/.test(name)) score += 14;
  if (/zira|david/.test(name)) score += 6;
  if (/compact|novelty|whisper|bad news|bells|boing|bubbles/.test(name)) score -= 30;
  if (voice.localService) score += 4;

  return score;
}

function pickVoice(lang, preferredVoiceURI = "auto") {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  if (preferredVoiceURI !== "auto") {
    const preferred = voices.find((voice) => voice.voiceURI === preferredVoiceURI);
    if (preferred) {
      return preferred;
    }
  }

  const exact = voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase());
  const candidates = voices
    .filter((voice) => scoreVoice(voice, lang) >= 0)
    .sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));

  if (candidates.length > 0) {
    return candidates[0];
  }

  return exact || voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
}

function getEnglishAccent() {
  return elements.englishAccentSelect.value || "en-GB";
}

function getSpeechRate() {
  const rate = Number.parseFloat(elements.speechRateInput.value);
  return Number.isFinite(rate) ? rate : 0.82;
}

function isClearSpeechEnabled() {
  return elements.clearSpeechInput.checked;
}

function updateSpeechRateLabel() {
  elements.speechRateValue.textContent = getSpeechRate().toFixed(2);
}

function saveSpeechSettings() {
  localStorage.setItem(ACCENT_STORAGE_KEY, getEnglishAccent());
  localStorage.setItem(VOICE_STORAGE_KEY, elements.englishVoiceSelect.value || "auto");
  localStorage.setItem(RATE_STORAGE_KEY, String(getSpeechRate()));
  localStorage.setItem(CLEAR_SPEECH_STORAGE_KEY, isClearSpeechEnabled() ? "1" : "0");
  updateSpeechRateLabel();
}

function loadEnglishAccent() {
  const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY);
  if (savedAccent === "en-US" || savedAccent === "en-GB") {
    elements.englishAccentSelect.value = savedAccent;
  }

  const savedRate = Number.parseFloat(localStorage.getItem(RATE_STORAGE_KEY));
  if (Number.isFinite(savedRate)) {
    elements.speechRateInput.value = String(Math.min(Math.max(savedRate, 0.65), 1));
  }

  const savedClearSpeech = localStorage.getItem(CLEAR_SPEECH_STORAGE_KEY);
  elements.clearSpeechInput.checked = savedClearSpeech !== "0";

  updateSpeechRateLabel();
  populateEnglishVoiceSelect();
}

function populateEnglishVoiceSelect() {
  const currentValue = localStorage.getItem(VOICE_STORAGE_KEY) || elements.englishVoiceSelect.value || "auto";
  const lang = getEnglishAccent();
  const voices = getVoices()
    .filter((voice) => scoreVoice(voice, lang) >= 0)
    .sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));

  elements.englishVoiceSelect.replaceChildren();

  const autoOption = document.createElement("option");
  autoOption.value = "auto";
  autoOption.textContent = "自动优选";
  elements.englishVoiceSelect.append(autoOption);

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.voiceURI;
    option.textContent = `${voice.name} (${voice.lang})`;
    elements.englishVoiceSelect.append(option);
  });

  elements.englishVoiceSelect.value = voices.some((voice) => voice.voiceURI === currentValue) ? currentValue : "auto";
}

function normalizeEnglishForSpeech(text) {
  return String(text || "")
    .replace(/[_/\\]+/g, " ")
    .replace(/[-]+/g, " ")
    .replace(/[^A-Za-z'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function speak(text, lang) {
  if (!text || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const speechText = lang.startsWith("en") && isClearSpeechEnabled() ? normalizeEnglishForSpeech(text) : text;
  if (!speechText) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = lang;
  utterance.rate = lang.startsWith("en")
    ? (isClearSpeechEnabled() ? Math.min(getSpeechRate(), 0.84) : getSpeechRate())
    : 0.9;
  utterance.pitch = lang.startsWith("en") ? 0.98 : 1;
  utterance.volume = 1;

  const preferredVoiceURI = lang.startsWith("en") ? elements.englishVoiceSelect.value : "auto";
  const voice = pickVoice(lang, preferredVoiceURI);
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("error", () => reject(new Error("图片读取失败")));
    reader.addEventListener("load", () => {
      const image = new Image();

      image.addEventListener("error", () => reject(new Error("图片加载失败")));
      image.addEventListener("load", () => {
        const maxSize = 1280;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });

      image.src = reader.result;
    });

    reader.readAsDataURL(file);
  });
}

function cleanRecognizedEnglish(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/[^A-Za-z\s'-]/g, " ").replace(/\s+/g, " ").trim())
    .filter((line) => /[A-Za-z]{2,}/.test(line));

  if (lines.length === 0) {
    return "";
  }

  const bestLine = lines.sort((a, b) => {
    const aLetters = (a.match(/[A-Za-z]/g) || []).length;
    const bLetters = (b.match(/[A-Za-z]/g) || []).length;
    return bLetters - aLetters;
  })[0];

  return bestLine.toLowerCase();
}

async function recognizeEnglish(imageData) {
  if (!window.Tesseract?.recognize) {
    throw new Error("OCR 未加载");
  }

  const result = await window.Tesseract.recognize(imageData, "eng", {
    logger(progress) {
      if (progress.status === "recognizing text") {
        const percent = Math.round(progress.progress * 100);
        elements.recognitionStatus.textContent = `正在识别英文 ${percent}%`;
      }
    },
  });

  return cleanRecognizedEnglish(result.data.text);
}

function translateFromDictionary(english) {
  const key = english.toLowerCase().replace(/[^a-z\s'-]/g, "").replace(/\s+/g, " ").trim();
  if (!key) {
    return "";
  }

  if (WORD_DICTIONARY[key]) {
    return WORD_DICTIONARY[key];
  }

  const singular = key.replace(/s$/, "");
  if (WORD_DICTIONARY[singular]) {
    return WORD_DICTIONARY[singular];
  }

  const words = key.split(" ");
  if (words.length > 1 && words.every((word) => WORD_DICTIONARY[word])) {
    return words.map((word) => WORD_DICTIONARY[word]).join("");
  }

  return "";
}

async function translateOnline(english) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(english)}&langpair=en|zh-CN`;
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();
    const translated = data?.responseData?.translatedText?.trim();

    if (!translated || /MYMEMORY|WARNING/i.test(translated)) {
      return "";
    }

    return translated;
  } catch {
    return "";
  } finally {
    window.clearTimeout(timeout);
  }
}

async function translateEnglish(english) {
  return translateFromDictionary(english) || (await translateOnline(english));
}

function setDefaultGroupForForm() {
  if (state.currentGroup !== "all") {
    elements.groupInput.value = state.currentGroup;
  }
}

function resetForm() {
  state.pendingImage = "";
  elements.cardForm.reset();
  elements.uploadHint.textContent = "选择一张卡片照片，会自动识别英文";
  elements.recognitionStatus.textContent = "上传后会自动填写英文和中文，可手动修改。OCR 和在线翻译需要联网。";
  setDefaultGroupForForm();
}

async function handlePhotoChange(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  state.isRecognizing = true;
  elements.uploadHint.textContent = "正在处理图片...";
  elements.recognitionStatus.textContent = "正在准备识别英文...";
  render();

  try {
    state.pendingImage = await compressImage(file);
    elements.uploadHint.textContent = file.name || "图片已选择";

    const recognizedEnglish = await recognizeEnglish(state.pendingImage);
    if (!recognizedEnglish) {
      elements.recognitionStatus.textContent = "没有识别到清晰英文，请手动填写。";
      return;
    }

    elements.englishInput.value = recognizedEnglish;
    elements.recognitionStatus.textContent = "已识别英文，正在翻译中文...";

    const translatedChinese = await translateEnglish(recognizedEnglish);
    if (translatedChinese) {
      elements.chineseInput.value = translatedChinese;
      elements.recognitionStatus.textContent = "已自动填写英文和中文，可手动修改。";
    } else {
      elements.recognitionStatus.textContent = "已自动填写英文，中文请手动填写。";
    }
  } catch {
    state.pendingImage = "";
    elements.uploadHint.textContent = "图片处理或识别失败，请重试";
    elements.recognitionStatus.textContent = "请检查网络，或手动填写英文和中文。";
  } finally {
    state.isRecognizing = false;
    render();
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const english = elements.englishInput.value.trim();
  const chinese = elements.chineseInput.value.trim();
  const group = normalizeGroup(elements.groupInput.value || (state.currentGroup === "all" ? "" : state.currentGroup));

  if (!state.pendingImage) {
    elements.uploadHint.textContent = "请先拍照或上传图片";
    elements.photoInput.focus();
    return;
  }

  if (!state.storageReady) {
    elements.uploadHint.textContent = "当前浏览器无法保存卡片";
    return;
  }

  if (!english || !chinese) {
    return;
  }

  const card = {
    id: window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    english,
    chinese,
    group,
    image: state.pendingImage,
    createdAt: Date.now(),
    source: "user",
  };

  try {
    await saveCard(card);
  } catch {
    elements.uploadHint.textContent = "保存失败，请删除部分卡片后重试";
    return;
  }

  state.cards.push(card);
  state.currentGroup = group;
  state.currentIndex = getVisibleCards().length - 1;
  saveCurrentGroup();
  resetForm();
  render();
}

async function deleteCard(cardId) {
  const cardIndex = state.cards.findIndex((card) => card.id === cardId);
  if (cardIndex < 0) {
    return;
  }

  if (state.cards[cardIndex].source === "local") {
    return;
  }

  try {
    await removeCard(cardId);
  } catch {
    return;
  }

  state.cards.splice(cardIndex, 1);
  if (state.isTestMode) {
    stopTest();
  }
  clampCurrentIndex();
  render();
}

async function clearCards() {
  if (!state.cards.some((card) => card.source !== "local")) {
    return;
  }

  const confirmed = window.confirm("确定清空所有拍照上传的卡片吗？本地资源不会删除。");
  if (!confirmed) {
    return;
  }

  try {
    await removeAllCards();
  } catch {
    return;
  }

  state.cards = getLocalCards();
  state.currentIndex = 0;
  state.currentGroup = "all";
  saveCurrentGroup();
  state.isTestMode = false;
  state.testCards = [];
  state.testIndex = 0;
  render();
}

function startTest() {
  const candidates = getVisibleCards();
  if (candidates.length === 0) {
    state.isTestMode = false;
    state.testCards = [];
    state.testIndex = 0;
    renderTestControls();
    return;
  }

  state.testCards = shuffleCards(candidates);
  state.isTestMode = true;
  state.testIndex = 0;
  renderTestControls();
}

function stopTest() {
  state.isTestMode = false;
  state.testCards = [];
  state.testIndex = 0;
  renderTestControls();
}

function openTest() {
  elements.testOverlay.classList.add("open");
  elements.testOverlay.setAttribute("aria-hidden", "false");
  startTest();
}

function closeTest() {
  stopTest();
  elements.testOverlay.classList.remove("open");
  elements.testOverlay.setAttribute("aria-hidden", "true");
}

function openSettings() {
  elements.settingsPanel.classList.add("open");
  elements.settingsPanel.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  elements.settingsPanel.classList.remove("open");
  elements.settingsPanel.setAttribute("aria-hidden", "true");
}

function bindEvents() {
  elements.previousButton.addEventListener("click", () => moveCard(-1));
  elements.nextButton.addEventListener("click", () => moveCard(1));
  elements.speakEnglishButton.addEventListener("click", () => speak(getCurrentCard()?.english, getEnglishAccent()));
  elements.speakChineseButton.addEventListener("click", () => speak(getCurrentCard()?.chinese, "zh-CN"));
  elements.englishAccentSelect.addEventListener("change", () => {
    populateEnglishVoiceSelect();
    saveSpeechSettings();
  });
  elements.englishVoiceSelect.addEventListener("change", saveSpeechSettings);
  elements.speechRateInput.addEventListener("input", saveSpeechSettings);
  elements.clearSpeechInput.addEventListener("change", saveSpeechSettings);
  elements.openTestButton.addEventListener("click", openTest);
  elements.closeTestButton.addEventListener("click", closeTest);
  elements.testPreviousButton.addEventListener("click", () => moveTestCard(-1));
  elements.testNextButton.addEventListener("click", () => moveTestCard(1));
  elements.testSpeakEnglishButton.addEventListener("click", () => speak(getCurrentTestCard()?.english, getEnglishAccent()));
  elements.testSpeakChineseButton.addEventListener("click", () => speak(getCurrentTestCard()?.chinese, "zh-CN"));
  elements.settingsButton.addEventListener("click", openSettings);
  elements.closeSettingsButton.addEventListener("click", closeSettings);
  elements.clearButton.addEventListener("click", clearCards);
  elements.photoInput.addEventListener("change", handlePhotoChange);
  elements.cardForm.addEventListener("submit", handleSubmit);
  elements.groupFilter.addEventListener("change", () => {
    state.currentGroup = elements.groupFilter.value;
    saveCurrentGroup();
    state.isTestMode = false;
    state.testCards = [];
    state.testIndex = 0;
    state.currentIndex = 0;
    resetForm();
    render();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTest();
      closeSettings();
    }
  });

  window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
    populateEnglishVoiceSelect();
  });
}

async function start() {
  try {
    state.db = await openDatabase();
    await loadCards();
  } catch {
    state.storageReady = false;
    state.cards = getLocalCards();
    elements.uploadHint.textContent = "当前浏览器无法保存卡片";
  }

  bindEvents();
  loadEnglishAccent();
  loadCurrentGroup();
  setDefaultGroupForForm();
  render();
}

start();
