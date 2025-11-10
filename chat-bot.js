const initialChatBots = [
  {
    id: "b2b-ai",
    name: "B2B Consulting (AI)",
    description: "AI-powered chatbot for business consulting",
    avatar: "indigo",
    initialMessage:
      "Hello! I'm an AI business consultant. Please ask about products or pricing.",
    apiKey: "",
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "24/7 customer support chatbot",
    avatar: "blue",
    initialMessage:
      "Hello! I'm your customer support assistant. How can I help you?",
    apiKey: "",
  },
  {
    id: "sales-assistant",
    name: "Sales Assistant",
    description: "Chatbot for sales and product consultation",
    avatar: "green",
    initialMessage:
      "Hi there! I'm your sales assistant. Which product would you like to learn about?",
    apiKey: "",
  },
  {
    id: "technical-support",
    name: "Technical Support",
    description: "Chatbot for technical support and troubleshooting",
    avatar: "purple",
    initialMessage:
      "Hello! I'm your technical support assistant. What do you need help with?",
    apiKey: "",
  },
];

const fakeChatBotsData = [
  {
    id: "b2b-ai",
    name: "B2B Consulting (AI)",
    description: "AI-powered chatbot for business consulting",
    avatar: "indigo",
    initialMessage:
      "Hello! I'm an AI business consultant. Please ask about products or pricing.",
    apiKey: "",
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "24/7 customer support chatbot",
    avatar: "blue",
    initialMessage:
      "Hello! I'm your customer support assistant. How can I help you?",
    apiKey: "",
  },
  {
    id: "sales-assistant",
    name: "Sales Assistant",
    description: "Chatbot for sales and product consultation",
    avatar: "green",
    initialMessage:
      "Hi there! I'm your sales assistant. Which product would you like to learn about?",
    apiKey: "",
  },
  {
    id: "technical-support",
    name: "Technical Support",
    description: "Chatbot for technical support and troubleshooting",
    avatar: "purple",
    initialMessage:
      "Hello! I'm your technical support assistant. What do you need help with?",
    apiKey: "",
  },
  {
    id: "marketing-bot",
    name: "Marketing Bot",
    description: "Chatbot for marketing and advertising support",
    avatar: "pink",
    initialMessage:
      "Hello! I'm your marketing bot. I can help with marketing strategies.",
    apiKey: "",
  },
  {
    id: "hr-bot",
    name: "HR Bot",
    description: "Chatbot for recruitment and HR management",
    avatar: "yellow",
    initialMessage:
      "Hello! I'm your HR bot. I can assist with recruitment and HR tasks.",
    apiKey: "",
  },
  {
    id: "finance-bot",
    name: "Finance Bot",
    description: "Chatbot for finance and accounting support",
    avatar: "teal",
    initialMessage:
      "Hello! I'm your finance bot. I can help with financial and accounting matters.",
    apiKey: "",
  },
  {
    id: "shipping-bot",
    name: "Shipping Bot",
    description: "Chatbot for shipping and delivery support",
    avatar: "orange",
    initialMessage:
      "Hello! I'm your shipping bot. I can help track orders and deliveries.",
    apiKey: "",
  },
  {
    id: "product-bot",
    name: "Product Bot",
    description: "Chatbot for product and service consultation",
    avatar: "cyan",
    initialMessage:
      "Hello! I'm your product bot. I can help you explore products and services.",
    apiKey: "",
  },
  {
    id: "order-bot",
    name: "Order Bot",
    description: "Chatbot for order management and placement",
    avatar: "amber",
    initialMessage:
      "Hello! I'm your order bot. I can help you place and track orders.",
    apiKey: "",
  },
  {
    id: "payment-bot",
    name: "Payment Bot",
    description: "Chatbot for payment and transaction support",
    avatar: "emerald",
    initialMessage:
      "Hello! I'm your payment bot. I can assist with payments and transactions.",
    apiKey: "",
  },
  {
    id: "faq-bot",
    name: "FAQ Bot",
    description: "Chatbot for frequently asked questions",
    avatar: "violet",
    initialMessage:
      "Hello! I'm your FAQ bot. I can answer your frequently asked questions.",
    apiKey: "",
  },
  {
    id: "support-bot-2",
    name: "Customer Support 2",
    description: "Advanced customer support chatbot",
    avatar: "rose",
    initialMessage:
      "Hello! I'm your advanced customer support bot. How can I assist you?",
    apiKey: "",
  },
  {
    id: "consultant-bot",
    name: "Consultant Bot",
    description: "Professional consulting chatbot",
    avatar: "sky",
    initialMessage:
      "Hello! I'm your professional consultant bot. I can advise you across various fields.",
    apiKey: "",
  },
  {
    id: "booking-bot",
    name: "Booking Bot",
    description: "Chatbot for scheduling and appointments",
    avatar: "fuchsia",
    initialMessage:
      "Hello! I'm your booking bot. I can help you schedule and manage appointments.",
    apiKey: "",
  },
  {
    id: "notification-bot",
    name: "Notification Bot",
    description: "Chatbot for sending notifications and updates",
    avatar: "lime",
    initialMessage:
      "Hello! I'm your notification bot. I can send you updates and alerts.",
    apiKey: "",
  },
];

// Danh sách chat bot hiện tại (được load)
let chatBots = [];
let currentPage = 1;
let hasMore = true;
let isLoading = false;
const itemsPerPage = 4; // Số lượng items mỗi lần load

// Biến lưu trữ chat bot hiện tại
let currentChatBot = null;
let messages = {}; // Lưu trữ tin nhắn theo từng chat bot
let messageHistory = {}; // Lưu trữ toàn bộ lịch sử tin nhắn (bao gồm chưa load)
let messagePage = {}; // Lưu trữ page hiện tại của tin nhắn theo từng bot
let hasMoreMessages = {}; // Lưu trữ trạng thái còn tin nhắn không
let isLoadingMessages = {}; // Lưu trữ trạng thái đang load tin nhắn
const messagesPerPage = 10; // Số lượng tin nhắn mỗi lần load

// Biến cho search
let searchTimeout = null;
let isSearching = false;
let searchResults = [];
let allChatBotsForSearch = []; // Lưu trữ toàn bộ chat bot để search

// Khai báo các biến jQuery cache
const $chatWindow = $("#chat-window");
const $messageArea = $("#message-area");
const $chatInput = $("#chat-input");
const $sendButton = $("#send-btn");
const $chatTab = $("#chat-tab");
const $listScreen = $("#list-screen");
const $chatScreen = $("#chat-screen");

// Khởi tạo
$(document).ready(function () {
  // Load data ban đầu
  loadInitialChatBots();

  // Xử lý sự kiện gửi tin nhắn
  $sendButton.on("click", sendMessage);
  $chatInput.on("keypress", function (e) {
    if (e.key === "Enter" && !$chatInput.prop("disabled")) {
      sendMessage();
    }
  });

  // Xử lý scroll để load more
  $("#chat-bot-list").on("scroll", handleScroll);

  // Xử lý scroll để load more tin nhắn
  $messageArea.on("scroll", handleMessageScroll);

  // Xử lý search input với debounce
  $("#search-input").on("input", handleSearchInput);
  $("#search-input").on("focus", function () {
    $(this).select();
  });

  // Xử lý clear search button
  $("#clear-search-btn").on("click", clearSearch);
});

// Load data ban đầu
async function loadInitialChatBots() {
  chatBots = [...initialChatBots];
  currentPage = 1;
  hasMore = true;

  // Lưu toàn bộ chat bot để search (bao gồm cả fakeChatBotsData)
  allChatBotsForSearch = [...fakeChatBotsData];

  renderChatBotList();
}

// Xử lý search input với debounce
function handleSearchInput() {
  const searchTerm = $("#search-input").val().trim();

  // Hiển thị/ẩn clear button
  if (searchTerm.length > 0) {
    $("#clear-search-btn").removeClass("hidden");
  } else {
    $("#clear-search-btn").addClass("hidden");
  }

  // Clear timeout trước đó
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Nếu search term rỗng, hiển thị lại danh sách ban đầu
  if (searchTerm === "") {
    chatBots = [...initialChatBots];
    currentPage = 1;
    hasMore = true;
    renderChatBotList();
    return;
  }

  // Debounce: chờ 500ms sau khi người dùng ngừng gõ
  searchTimeout = setTimeout(() => {
    performSearch(searchTerm);
  }, 500);
}

// Thực hiện search
async function performSearch(searchTerm) {
  if (isSearching) return;

  isSearching = true;
  showSearchLoading();

  try {
    // Mô phỏng delay của API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Mô phỏng gọi API search
    const results = await searchChatBotsAPI(searchTerm);

    // Cập nhật danh sách với kết quả tìm kiếm
    chatBots = results;
    hasMore = false; // Không load more khi đang search
    renderChatBotList();

    // Hiển thị thông báo nếu không có kết quả
    if (results.length === 0) {
      showNoSearchResults(searchTerm);
    }
  } catch (error) {
    console.error("Lỗi khi tìm kiếm:", error);
  } finally {
    isSearching = false;
    hideSearchLoading();
  }
}

// Mô phỏng API search chat bots
async function searchChatBotsAPI(searchTerm) {
  // Trong thực tế, bạn sẽ gọi API thật: fetch('/api/chat-bots/search?q=' + encodeURIComponent(searchTerm))

  // Mô phỏng: tìm kiếm trong allChatBotsForSearch
  const lowerSearchTerm = searchTerm.toLowerCase();

  return allChatBotsForSearch.filter((bot) => {
    const nameMatch = bot.name.toLowerCase().includes(lowerSearchTerm);
    const descMatch = bot.description.toLowerCase().includes(lowerSearchTerm);
    return nameMatch || descMatch;
  });
}

// Hiển thị loading khi search
function showSearchLoading() {
  $("#search-loading").removeClass("hidden");
}

// Ẩn loading khi search
function hideSearchLoading() {
  $("#search-loading").addClass("hidden");
}

// Hiển thị thông báo không có kết quả
function showNoSearchResults(searchTerm) {
  const noResultsHtml = `
    <div class="flex flex-col items-center justify-center py-8 text-center">
           <img src="https://sehanf.cafe24.com/web/product/medium/user.svg" alt="user-avatar" />

      <h3 class="text-lg font-semibold text-gray-600 mb-2">
        Can't find any results
      </h3>
      <p class="text-sm text-gray-400">
        Can't find any results for "<strong>${searchTerm}</strong>"
      </p>
    </div>
  `;

  // Remove old message if any

  // Add new message
  $("#chat-bot-list").append(
    `<div id="no-search-results">${noResultsHtml}</div>`
  );
}

// Clear search
function clearSearch() {
  $("#search-input").val("");
  $("#clear-search-btn").addClass("hidden");

  // Show initial chat bots list
  chatBots = [...initialChatBots];
  currentPage = 1;
  hasMore = true;
  renderChatBotList();

  // Delete no search results message if any
  $("#no-search-results").remove();
}

// Scroll to load more chat bots
function handleScroll() {
  const $list = $("#chat-bot-list");
  const scrollTop = $list.scrollTop();
  const scrollHeight = $list.prop("scrollHeight");
  const clientHeight = $list.height();

  // Check if scroll is near the end (100px)
  if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
    loadMoreChatBots();
  }
}

// Mô phỏng gọi API để load thêm chat bot
async function loadMoreChatBots() {
  if (isLoading || !hasMore) return;

  isLoading = true;
  showLoadingIndicator();

  try {
    // Mô phỏng delay của API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Tính toán items cần load (bỏ qua 4 items đầu vì đã load ban đầu)
    const startIndex = chatBots.length;
    const endIndex = startIndex + itemsPerPage;
    const newBots = fakeChatBotsData.slice(startIndex, endIndex);

    if (newBots.length > 0) {
      // Thêm bot mới vào danh sách
      chatBots = [...chatBots, ...newBots];
      currentPage++;

      // Render thêm items
      appendChatBotItems(newBots);

      // Kiểm tra còn data không
      if (endIndex >= fakeChatBotsData.length) {
        hasMore = false;
        // Hiển thị thông báo hết data
        showEndOfListMessage();
      }
    } else {
      hasMore = false;
      showEndOfListMessage();
    }
  } catch (error) {
    console.error("Lỗi khi load thêm chat bot:", error);
  } finally {
    isLoading = false;
    hideLoadingIndicator();
  }
}

// Hiển thị thông báo hết data
function showEndOfListMessage() {
  // Kiểm tra xem đã có message chưa
  if ($("#end-of-list-message").length > 0) return;

  const endMessage = `
    <div id="end-of-list-message" class="flex justify-center items-center py-4 text-sm text-gray-500">
      Đã hiển thị tất cả chat bot
    </div>
  `;
  $("#chat-bot-list").append(endMessage);
}

// Hiển thị loading indicator
function showLoadingIndicator() {
  const loadingHtml = `
    <div id="loading-more" class="flex justify-center items-center py-4">
      <div class="lds-dual-ring"></div>
      <span class="ml-2 text-sm text-gray-500">Đang tải thêm...</span>
    </div>
  `;
  $("#chat-bot-list").append(loadingHtml);
}

// Ẩn loading indicator
function hideLoadingIndicator() {
  $("#loading-more").remove();
}

// Mở/Đóng tab (toggle chat)
function toggleChat() {
  // Kiểm tra class 'opacity-0' để xác định trạng thái đóng
  const isHidden = $chatTab.hasClass("opacity-0");

  if (isHidden) {
    // Open tab - always show list screen when open
    $chatTab
      .removeClass("opacity-0 scale-95 pointer-events-none")
      .addClass("opacity-100 scale-100 pointer-events-auto");

    showListScreen();
  } else {
    // Close tab
    $chatTab
      .removeClass("opacity-100 scale-100 pointer-events-auto")
      .addClass("opacity-0 scale-95 pointer-events-none");
  }
}

// Show list screen
function showListScreen() {
  $listScreen.addClass("active");
  $chatScreen.removeClass("active");
}

// Show chat screen
function showChatScreen() {
  $listScreen.removeClass("active");
  $chatScreen.addClass("active");
  setTimeout(() => {
    $chatInput.focus();
  }, 100);
}

// Back to list screen
function backToList() {
  showListScreen();
}

// Render chat bots list
function renderChatBotList() {
  const $list = $("#chat-bot-list");
  $list.empty();

  // Delete no search results message if any
  $("#no-search-results").remove();

  if (chatBots.length > 0) {
    appendChatBotItems(chatBots);
  }
}

// Render more chat bot items
function appendChatBotItems(bots) {
  const $list = $("#chat-bot-list");

  bots.forEach((bot) => {
    const avatarColors = {
      indigo: "bg-indigo-100 text-indigo-600",
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      pink: "bg-pink-100 text-pink-600",
      yellow: "bg-yellow-100 text-yellow-600",
      teal: "bg-teal-100 text-teal-600",
      orange: "bg-orange-100 text-orange-600",
      cyan: "bg-cyan-100 text-cyan-600",
      amber: "bg-amber-100 text-amber-600",
      emerald: "bg-emerald-100 text-emerald-600",
      violet: "bg-violet-100 text-violet-600",
      rose: "bg-rose-100 text-rose-600",
      sky: "bg-sky-100 text-sky-600",
      fuchsia: "bg-fuchsia-100 text-fuchsia-600",
      lime: "bg-lime-100 text-lime-600",
    };

    const avatarClass = "bg-gray-100 rounded-[8px]";

    const botItem = `
      <div
        class="chat-bot-item p-2 rounded-lg cursor-pointer hover:border-indigo-300 hover:shadow-md"
        data-bot-id="${bot.id}"
      >
        <div class="flex items-center">
          <div class="w-12 h-12 avatar-chat-list flex items-center justify-center flex-shrink-0 mr-3">
           <img src="https://sehanf.cafe24.com/web/product/medium/user.svg" alt="user-avatar" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[16px] font-semibold text-gray-800 truncate">${bot.name}</h3>
            <p class="text-[14px] text-gray-600 truncate">${bot.description}</p>
          </div>
        </div>
      </div>
    `;

    $list.append(botItem);
  });

  // Gắn sự kiện click cho từng item (sử dụng event delegation)
  $(document)
    .off("click", ".chat-bot-item")
    .on("click", ".chat-bot-item", function () {
      const botId = $(this).data("bot-id");
      selectChatBot(botId);
    });
}

// Format ngày để hiển thị
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time để so sánh ngày
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return "Yesterday";
  } else {
    // Format: "Thứ 2, 15/01/2024"
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  }
}

// Kiểm tra xem 2 timestamp có khác ngày không
function isDifferentDay(timestamp1, timestamp2) {
  if (!timestamp1 || !timestamp2) return true;

  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getDate() !== date2.getDate()
  );
}

// Render date divider (vạch kẻ ngang)
function renderDateDivider(timestamp) {
  const dateText = formatDate(timestamp);
  return `
    <div class="flex items-center justify-center my-4">
      <div class="flex-1 border-t border-gray-300"></div>
      <span class="px-3 text-xs text-gray-500 bg-gray-50 rounded-full">${dateText}</span>
      <div class="flex-1 border-t border-gray-300"></div>
    </div>
  `;
}

// Tạo fake messages cho chat bot
function generateFakeMessages(botId, count = 30) {
  const fakeMessages = [];
  const userMessages = [
    "Hello!",
    "Can you help me?",
    "I need support with a product",
    "What are the prices?",
    "Can you give more advice?",
    "Thank you!",
    "I want to place an order",
    "Are there other products?",
    "Can you explain more clearly?",
    "Got it, thanks!",
  ];
  const botMessages = [
    "Hello! How can I assist you?",
    "Absolutely, I'm here to help.",
    "This product is very reasonably priced.",
    "What would you like more advice on?",
    "You're welcome, happy to help!",
    "I'll help you place the order right away.",
    "There are many other products that suit you.",
    "I'll explain it in detail for you.",
    "Glad to serve you!",
    "Do you have any other questions?",
  ];

  // Tạo tin nhắn ban đầu (hôm nay)
  const bot = chatBots.find((b) => b.id === botId);
  if (bot) {
    fakeMessages.push({
      sender: "bot",
      text: bot.initialMessage,
      timestamp: new Date().toISOString(),
    });
  }

  // Tạo các tin nhắn fake với timestamp khác nhau
  // Một số tin nhắn cách nhau nhiều ngày để test date divider
  for (let i = count - 1; i >= 0; i--) {
    const isUser = i % 2 === 0;
    const messageText = isUser
      ? userMessages[i % userMessages.length]
      : botMessages[i % botMessages.length];

    // Tạo timestamp với khoảng cách khác nhau
    // Một số tin nhắn cách nhau 1 ngày, một số cách nhau vài giờ
    let timeDiff;
    if (i < 5) {
      // 5 tin nhắn gần nhất: cách nhau vài phút (hôm nay)
      timeDiff = i * 30 * 60000; // 30 phút mỗi tin nhắn
    } else if (i < 15) {
      // 10 tin nhắn tiếp theo: cách nhau vài giờ (hôm qua)
      timeDiff = (i - 5) * 2 * 60 * 60000 + 24 * 60 * 60000; // 2 giờ mỗi tin nhắn, bắt đầu từ hôm qua
    } else {
      // Các tin nhắn còn lại: cách nhau 1-2 ngày
      timeDiff = (i - 15) * 1.5 * 24 * 60 * 60000 + 3 * 24 * 60 * 60000; // Cách nhau 1.5 ngày
    }

    fakeMessages.push({
      sender: isUser ? "user" : "bot",
      text: messageText,
      timestamp: new Date(Date.now() - timeDiff).toISOString(),
    });
  }

  return fakeMessages.reverse(); // Đảo ngược để tin nhắn cũ nhất ở đầu
}

// Chọn chat bot
function selectChatBot(botId) {
  const bot = chatBots.find((b) => b.id === botId);
  if (!bot) return;

  currentChatBot = bot;

  // Cập nhật active state trong danh sách
  $(".chat-bot-item").removeClass("active");
  $(`.chat-bot-item[data-bot-id="${botId}"]`).addClass("active");

  // Cập nhật header chat window
  updateChatWindowHeader(bot);

  // Chuyển sang màn hình chat
  showChatScreen();

  // Khởi tạo hoặc khôi phục tin nhắn
  if (messages[botId] && messages[botId].length > 0) {
    // Nếu đã có tin nhắn, khôi phục
    restoreMessages(botId);
  } else {
    // Khởi tạo data fake cho chat
    initializeChatMessages(botId);
  }

  // Cuộn xuống cuối
  setTimeout(() => {
    $messageArea.scrollTop($messageArea.prop("scrollHeight"));
  }, 100);
}

// Khởi tạo tin nhắn cho chat
function initializeChatMessages(botId) {
  // Tạo toàn bộ lịch sử tin nhắn fake (30 tin nhắn)
  messageHistory[botId] = generateFakeMessages(botId, 30);

  // Khởi tạo pagination
  // Theo dõi index bắt đầu đã load (tin nhắn cũ nhất chưa load)
  messagePage[botId] = 0; // Index của tin nhắn cũ nhất chưa load
  hasMoreMessages[botId] = messageHistory[botId].length > messagesPerPage;
  isLoadingMessages[botId] = false;

  // Load tin nhắn ban đầu (10 tin nhắn mới nhất)
  // Tin nhắn mới nhất ở cuối messageHistory
  const totalMessages = messageHistory[botId].length;
  const startIndex = Math.max(0, totalMessages - messagesPerPage);
  const initialMessages = messageHistory[botId].slice(startIndex);
  messages[botId] = [...initialMessages];

  // Cập nhật page index (tin nhắn cũ nhất chưa load là startIndex)
  messagePage[botId] = startIndex;

  // Render tin nhắn ban đầu
  $messageArea.empty();
  initialMessages.forEach((msg, index) => {
    const previousMsg = index > 0 ? initialMessages[index - 1] : null;
    const previousTimestamp = previousMsg ? previousMsg.timestamp : null;
    appendMessage(
      msg.sender,
      msg.text,
      msg.timestamp,
      false,
      previousTimestamp
    );
  });
}

// Cập nhật header chat window
function updateChatWindowHeader(bot) {
  const avatarColors = {
    indigo: "bg-indigo-100 text-indigo-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const avatarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ${
      avatarColors[bot.avatar].split(" ")[1]
    }" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  `;

  $("#chat-header-avatar")
    .removeClass()
    .addClass(
      `w-10 h-10 rounded-full ${
        avatarColors[bot.avatar].split(" ")[0]
      } flex items-center justify-center mr-3 shadow-md`
    )
    .html(avatarSvg);

  $("#chat-header-title").text(bot.name);
}

// Khôi phục tin nhắn
function restoreMessages(botId) {
  $messageArea.empty();

  // Render lại tất cả tin nhắn đã load
  if (messages[botId]) {
    messages[botId].forEach((msg, index) => {
      const previousMsg = index > 0 ? messages[botId][index - 1] : null;
      const previousTimestamp = previousMsg ? previousMsg.timestamp : null;
      appendMessage(
        msg.sender,
        msg.text,
        msg.timestamp,
        false,
        previousTimestamp
      );
    });
  }

  $messageArea.scrollTop($messageArea.prop("scrollHeight"));
}

// Xử lý scroll để load thêm tin nhắn cũ
function handleMessageScroll() {
  const scrollTop = $messageArea.scrollTop();

  // Nếu scroll lên gần đầu (còn 200px) thì load thêm tin nhắn cũ
  if (
    scrollTop < 200 &&
    currentChatBot &&
    hasMoreMessages[currentChatBot.id] &&
    !isLoadingMessages[currentChatBot.id]
  ) {
    loadMoreMessages();
  }
}

// Load thêm tin nhắn cũ
async function loadMoreMessages() {
  if (!currentChatBot) return;

  const botId = currentChatBot.id;
  if (isLoadingMessages[botId] || !hasMoreMessages[botId]) return;

  isLoadingMessages[botId] = true;
  showMessageLoadingIndicator();

  try {
    // Mô phỏng delay của API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Tính toán tin nhắn cũ cần load
    // messagePage[botId] là index của tin nhắn cũ nhất chưa load
    const startIndex = messagePage[botId] || 0;
    const loadCount = Math.min(messagesPerPage, startIndex);

    if (loadCount > 0) {
      // Load tin nhắn cũ từ messageHistory
      const endIndex = startIndex;
      const newStartIndex = Math.max(0, startIndex - messagesPerPage);
      const oldMessages = messageHistory[botId].slice(newStartIndex, endIndex);

      if (oldMessages.length > 0) {
        // Lưu scroll position hiện tại
        const oldScrollHeight = $messageArea.prop("scrollHeight");
        const oldScrollTop = $messageArea.scrollTop();

        // Prepend tin nhắn cũ vào đầu messages (tin nhắn cũ nhất ở đầu)
        messages[botId] = [...oldMessages, ...messages[botId]];

        // Cập nhật page index
        messagePage[botId] = newStartIndex;

        // Render tin nhắn cũ (đảo ngược để hiển thị đúng thứ tự từ trên xuống)
        // Tin nhắn cũ nhất render trước, sau đó đến tin nhắn mới hơn
        const firstExistingMsg =
          messages[botId] && messages[botId].length > 0
            ? messages[botId][0]
            : null;
        const firstExistingTimestamp = firstExistingMsg
          ? firstExistingMsg.timestamp
          : null;

        // Đảo ngược oldMessages để render từ cũ nhất đến mới nhất
        const reversedOldMessages = [...oldMessages].reverse();
        reversedOldMessages.forEach((msg, index) => {
          // Tin nhắn tiếp theo là tin nhắn mới hơn (index + 1) hoặc tin nhắn đầu tiên đã có
          const nextMsg =
            index < reversedOldMessages.length - 1
              ? reversedOldMessages[index + 1]
              : firstExistingMsg;
          const nextTimestamp = nextMsg ? nextMsg.timestamp : null;
          prependMessage(msg.sender, msg.text, msg.timestamp, nextTimestamp);
        });

        // Khôi phục scroll position
        const newScrollHeight = $messageArea.prop("scrollHeight");
        const scrollDiff = newScrollHeight - oldScrollHeight;
        $messageArea.scrollTop(oldScrollTop + scrollDiff);

        // Kiểm tra còn tin nhắn không
        if (newStartIndex <= 0) {
          hasMoreMessages[botId] = false;
        }
      } else {
        hasMoreMessages[botId] = false;
      }
    } else {
      hasMoreMessages[botId] = false;
    }
  } catch (error) {
    console.error("Lỗi khi load thêm tin nhắn:", error);
  } finally {
    isLoadingMessages[botId] = false;
    hideMessageLoadingIndicator();
  }
}

// Prepend tin nhắn vào đầu (để hiển thị tin nhắn cũ)
function prependMessage(sender, text, timestamp = null, nextTimestamp = null) {
  const isUser = sender === "user";
  const formattedText = text.replace(/\n/g, "<br>");
  const currentTimestamp = timestamp || new Date().toISOString();

  // Kiểm tra xem có cần hiển thị date divider không (sau tin nhắn này)
  let dateDividerHtml = "";
  if (nextTimestamp && isDifferentDay(currentTimestamp, nextTimestamp)) {
    dateDividerHtml = renderDateDivider(nextTimestamp);
  }

  // Avatar cho bot
  let botAvatarClass = "bg-indigo-100 text-indigo-600";
  if (currentChatBot) {
    const avatarColors = {
      indigo: "bg-indigo-100 text-indigo-600",
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      pink: "bg-pink-100 text-pink-600",
      yellow: "bg-yellow-100 text-yellow-600",
      teal: "bg-teal-100 text-teal-600",
      orange: "bg-orange-100 text-orange-600",
      cyan: "bg-cyan-100 text-cyan-600",
      amber: "bg-amber-100 text-amber-600",
      emerald: "bg-emerald-100 text-emerald-600",
      violet: "bg-violet-100 text-violet-600",
      rose: "bg-rose-100 text-rose-600",
      sky: "bg-sky-100 text-sky-600",
      fuchsia: "bg-fuchsia-100 text-fuchsia-600",
      lime: "bg-lime-100 text-lime-600",
    };
    botAvatarClass = avatarColors[currentChatBot.avatar] || botAvatarClass;
  }

  const botAvatar = `
    <div class="w-8 h-8 rounded-lg chat-bot-around flex items-center justify-center flex-shrink-0">
      <img src="https://sehanf.cafe24.com/web/product/medium/bot-avatar.svg" alt="bot-avatar" />
    </div>
  `;

  // Avatar cho user
  const userAvatar = `
    <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
           <img src="https://sehanf.cafe24.com/web/product/medium/user.svg" alt="user-avatar" />
     
    </div>
  `;

  const messageHtml = `
    <div class="flex ${
      isUser ? "justify-end" : "justify-start"
    } items-end gap-2">
      ${!isUser ? botAvatar : ""}
      <div class="max-w-[80%] p-3 rounded-xl shadow-sm text-sm ${
        isUser ? "background-main-color text-white" : "bg-white text-black-800"
      }">
        ${formattedText}
      </div>
    </div>
    ${dateDividerHtml}
  `;

  // Prepend vào đầu message area
  $messageArea.prepend(messageHtml);
}

// Hiển thị loading indicator cho tin nhắn
function showMessageLoadingIndicator() {
  const loadingHtml = `
    <div id="loading-messages" class="flex justify-center items-center py-2">
      <div class="lds-dual-ring"></div>
      <span class="ml-2 text-xs text-gray-500">Loading...</span>
    </div>
  `;
  $messageArea.prepend(loadingHtml);
}

// Ẩn loading indicator cho tin nhắn
function hideMessageLoadingIndicator() {
  $("#loading-messages").remove();
}

// Thêm tin nhắn vào khung chat
function appendMessage(
  sender,
  text,
  timestamp = null,
  saveToHistory = true,
  previousTimestamp = null
) {
  const isUser = sender === "user";
  const formattedText = text.replace(/\n/g, "<br>");
  const currentTimestamp = timestamp || new Date().toISOString();

  // Kiểm tra xem có cần hiển thị date divider không
  let dateDividerHtml = "";
  if (
    previousTimestamp &&
    isDifferentDay(currentTimestamp, previousTimestamp)
  ) {
    dateDividerHtml = renderDateDivider(currentTimestamp);
  }

  // Avatar cho bot (dựa trên bot hiện tại)
  let botAvatarClass = "bg-indigo-100 text-indigo-600";
  if (currentChatBot) {
    const avatarColors = {
      green: "bg-green-100 text-green-600",
    };
    botAvatarClass = avatarColors[currentChatBot.avatar] || botAvatarClass;
  }

  const botAvatar = `
    <div class="w-8 h-8 rounded-lg chat-bot-around flex items-center justify-center flex-shrink-0">
      <img src="https://sehanf.cafe24.com/web/product/medium/bot-avatar.svg" alt="bot-avatar" />
    </div>
  `;

  const messageHtml = `
    ${dateDividerHtml}
    <div class="flex ${
      isUser ? "justify-end" : "justify-start"
    } items-end gap-2">
      ${!isUser ? botAvatar : ""}
      <div class="max-w-[80%] p-3 rounded-xl shadow-sm text-sm ${
        isUser ? "background-main-color text-white" : "bg-white text-gray-800"
      }">
        ${formattedText}
      </div>
    </div>
  `;

  $messageArea.append(messageHtml);
  $messageArea.scrollTop($messageArea.prop("scrollHeight"));

  // Lưu vào lịch sử
  if (saveToHistory && currentChatBot) {
    if (!messages[currentChatBot.id]) {
      messages[currentChatBot.id] = [];
    }
    messages[currentChatBot.id].push({
      sender,
      text,
      timestamp: currentTimestamp,
    });
  }
}

// Hiển thị loading indicator
function appendLoadingIndicator() {
  let botAvatarClass = "bg-indigo-100 text-indigo-600";
  if (currentChatBot) {
    const avatarColors = {
      green: "bg-green-100 text-green-600",
    };
    botAvatarClass = avatarColors[currentChatBot.avatar] || botAvatarClass;
  }

  const botAvatar = `
    <div class="w-8 h-8 rounded-lg chat-bot-around flex items-center justify-center flex-shrink-0">
      <img src="https://sehanf.cafe24.com/web/product/medium/bot-avatar.svg" alt="bot-avatar" />
    </div>
  `;
  const loadingHtml = `
    <div class="flex justify-start items-end gap-2" id="loading-indicator">
      ${botAvatar}
      <div class="max-w-[80%] bg-white p-3 rounded-xl shadow-sm border border-gray-200 text-sm">
        <div class="lds-dual-ring"></div>
      </div>
    </div>
  `;
  $messageArea.append(loadingHtml);
  $messageArea.scrollTop($messageArea.prop("scrollHeight"));
}

// Xóa loading indicator
function removeLoadingIndicator() {
  $("#loading-indicator").remove();
}

// Gửi tin nhắn
async function sendMessage() {
  if (!currentChatBot) {
    // Mở tab nếu chưa mở
    if ($chatTab.hasClass("opacity-0")) {
      toggleChat();
    }
    return;
  }

  const userText = $chatInput.val().trim();
  if (userText === "") return;

  // Vô hiệu hóa input/button
  $chatInput.prop("disabled", true);
  $sendButton.prop("disabled", true);

  // Lấy tin nhắn cuối cùng để kiểm tra date divider
  const botId = currentChatBot.id;
  const lastMessage =
    messages[botId] && messages[botId].length > 0
      ? messages[botId][messages[botId].length - 1]
      : null;
  const previousTimestamp = lastMessage ? lastMessage.timestamp : null;
  const currentTimestamp = new Date().toISOString();

  // Hiển thị tin nhắn user
  appendMessage("user", userText, currentTimestamp, true, previousTimestamp);
  $chatInput.val("");

  // Hiển thị loading
  appendLoadingIndicator();

  try {
    // Gọi API
    const botResponse = await getLLMResponse(userText, currentChatBot);

    // Xóa loading và hiển thị phản hồi
    removeLoadingIndicator();
    const botTimestamp = new Date().toISOString();
    appendMessage("bot", botResponse, botTimestamp, true, currentTimestamp);

    // MÔ PHỎNG GỌI API TẠO ĐƠN (NẾU PHÁT HIỆN Ý ĐỊNH ĐẶT HÀNG)
    if (
      (userText.toLowerCase().includes("tạo đơn hàng") ||
        userText.toLowerCase().includes("đặt hàng")) &&
      currentChatBot.id === "b2b-ai"
    ) {
      setTimeout(() => {
        const orderTimestamp = new Date().toISOString();
        appendMessage(
          "bot",
          `✅ **ĐÃ TẠO ĐƠN HÀNG THÀNH CÔNG (Mô phỏng):** Mã Đơn hàng (eCount) là **EC-100023**. Bạn có muốn xem thêm sản phẩm nào không?`,
          orderTimestamp,
          true,
          botTimestamp
        );
      }, 1500); // Độ trễ mô phỏng tạo đơn
    }
  } catch (error) {
    removeLoadingIndicator();
    const errorTimestamp = new Date().toISOString();
    const lastMsg =
      messages[botId] && messages[botId].length > 0
        ? messages[botId][messages[botId].length - 1]
        : null;
    const lastTimestamp = lastMsg ? lastMsg.timestamp : currentTimestamp;
    appendMessage(
      "bot",
      `Xảy ra lỗi: ${error.message}`,
      errorTimestamp,
      true,
      lastTimestamp
    );
  } finally {
    // Khôi phục input/button
    $chatInput.prop("disabled", false);
    $sendButton.prop("disabled", false);
    $chatInput.focus();
  }
}

// Mô phỏng hàm gọi API để lấy dữ liệu sản phẩm
async function fetchProductData(query) {
  if (query.toLowerCase().includes("áo polo")) {
    return {
      status: "success",
      product_data: [
        {
          sku: "AP-L-BLU",
          name: "Áo Polo Cotton",
          size: "L",
          stock: 150,
          price: 550000,
        },
      ],
    };
  }
  return { status: "not_found" };
}

// Call LLM API (integrated with logic from chat-bot.js)
async function getLLMResponse(userQuery, bot) {
  const apiKey = bot.apiKey || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  // Fetch product data (simulated)
  const productInfo = await fetchProductData(userQuery);
  let groundingContext = "";

  if (productInfo.status === "success") {
    const product = productInfo.product_data[0];
    groundingContext = `Product data from eCount: Name: ${product.name}, Price: ${product.price} VND, Stock: ${product.stock}.`;
  } else {
    groundingContext = "No internal product data available for reference.";
  }

  // Create system prompt based on bot type
  let systemPrompt = "";
  if (bot.id === "b2b-ai") {
    systemPrompt = `You are a B2B sales assistant. Respond in Vietnamese, based on the following product data: ${groundingContext}. Always suggest automatic order creation.`;
  } else if (bot.id === "customer-support") {
    systemPrompt = `You are a professional customer support assistant. Respond in Vietnamese, helping customers enthusiastically and effectively.`;
  } else if (bot.id === "sales-assistant") {
    systemPrompt = `You are a sales assistant. Respond in Vietnamese, consult on products, and help customers find suitable items.`;
  } else {
    systemPrompt = `You are a technical support assistant. Respond in Vietnamese, answer technical questions clearly and thoroughly.`;
  }

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  try {
    // If no API key is provided, return a simulated response
    if (!apiKey) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            `[Simulated] Thank you for using ${bot.name}. I received your question: "${userQuery}". To use real AI, please configure the API key for this chatbot.`
          );
        }, 800);
      });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return `[API Error: ${response.status}] Sorry, the AI system is under maintenance. For your question "${userQuery}", I can simulate a response: Blue Polo Shirt size L costs 550,000 VND and stock is 150. Would you like to create an order now?`;
    }

    const result = await response.json();
    return (
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I didn't quite understand. Could you please clarify?"
    );
  } catch (error) {
    console.error("Gemini API connection error:", error);
    return `[Connection Error] Sorry, I couldn't connect. Please check your network or try again later.`;
  }
}
