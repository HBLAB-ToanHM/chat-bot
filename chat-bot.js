let initialChatBots = [];

// Current chat bot list (loaded)
let chatBots = [];
let currentPage = 1;
let hasMore = true;
let isLoading = false;
const itemsPerPage = 4; // Number of items per load

// Variable to store current chat bot
let currentChatBot = null;
let messages = {}; // Store messages by chat bot
let messageHistory = {}; // Store entire message history (including unloaded)
let messagePage = {}; // Store current page of messages by bot
let hasMoreMessages = {}; // Store status of whether there are more messages
let isLoadingMessages = {}; // Store status of loading messages
const messagesPerPage = 10; // Number of messages per load

// Variables for search
let searchTimeout = null;
let isSearching = false;
let searchResults = [];

// Declare jQuery cache variables
const $chatWindow = $("#chat-window");
const $messageArea = $("#message-area");
const $chatInput = $("#chat-input");
const $sendButton = $("#send-btn");
const $chatTab = $("#chat-tab");
const $listScreen = $("#list-screen");
const $chatScreen = $("#chat-screen");

const SOCKET_ENDPOINT =
  "https://pleximetric-sharlene-unfitly.ngrok-free.dev/chat";
const SOCKET_OPTIONS = {
  transports: ["websocket"],
  auth: {
    sessionId: null,
    userId: "user_test_001",
    adminId: null,
    storeId: "store_test_001",
    userType: "user",
  },
};

let externalSocket = null;
let isSocketInitialized = false;

let currentBot = null;
let isSending = false;
let isInitialized = false;

// Initialize
$(document).ready(function () {
  // Load initial data
  loadInitialChatBots();

  // call api get token when start page
  getToken().catch((error) => {
    console.error("Error getting token on page load:", error);
  });
  // Handle send message event
  $sendButton.on("click", sendMessage);
  $chatInput.on("keypress", function (e) {
    if (e.key === "Enter" && !$chatInput.prop("disabled")) {
      sendMessage();
    }
  });

  // Handle scroll to load more
  $("#chat-bot-list").on("scroll", handleScroll);

  // Handle scroll to load more messages
  $messageArea.on("scroll", handleMessageScroll);

  // Handle search input with debounce
  $("#search-input").on("input", handleSearchInput);
  $("#search-input").on("focus", function () {
    $(this).select();
  });

  // Handle clear search button
  $("#clear-search-btn").on("click", clearSearch);
});

// Load initial data
async function loadInitialChatBots() {
  if (
    !window.ChatBotAPI ||
    typeof window.ChatBotAPI.getChatBotAdmin !== "function"
  ) {
    console.error("ChatBotAPI.getChatBotAdmin is not available");
    return;
  }

  currentPage = 1;

  try {
    const data = await window.ChatBotAPI.getChatBotAdmin({
      page: currentPage,
      limit: itemsPerPage,
    });
    console.log("data", data);
    initialChatBots = Array.isArray(data) ? data : [];
    console.log("initialChatBots", initialChatBots);
    chatBots = [...initialChatBots];
    // hasMore = Boolean(more);
  } catch (error) {
    console.error("Error loading initial chat bots:", error);
    initialChatBots = [];
    chatBots = [];
    // hasMore = false;
  }

  renderChatBotList();
}

// Handle search input with debounce
function handleSearchInput() {
  const searchTerm = $("#search-input").val().trim();

  // Show/hide clear button
  if (searchTerm.length > 0) {
    $("#clear-search-btn").removeClass("hidden");
  } else {
    $("#clear-search-btn").addClass("hidden");
  }

  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // If search term is empty, show initial list again
  if (searchTerm === "") {
    loadInitialChatBots();
    return;
  }

  // Debounce: wait 500ms after user stops typing
  searchTimeout = setTimeout(() => {
    performSearch(searchTerm);
  }, 500);
}

// Perform search
async function performSearch(searchTerm) {
  if (isSearching) return;

  if (
    !window.ChatBotAPI ||
    typeof window.ChatBotAPI.searchChatBots !== "function"
  ) {
    console.error("ChatBotAPI.searchChatBots is not available");
    return;
  }

  isSearching = true;
  showSearchLoading();

  try {
    const results = await window.ChatBotAPI.getChatBotAdmin({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
    });
    // Update list with search results
    chatBots = Array.isArray(results) ? results : [];
    hasMore = false; // Don't load more when searching
    renderChatBotList();

    // Show message if no results
    if (results.length === 0) {
      showNoSearchResults(searchTerm);
    }
  } catch (error) {
    console.error("Error searching:", error);
  } finally {
    isSearching = false;
    hideSearchLoading();
  }
}

// Show loading when searching
function showSearchLoading() {
  $("#search-loading").removeClass("hidden");
}

// Hide loading when searching
function hideSearchLoading() {
  $("#search-loading").addClass("hidden");
}

// Show no results message
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

  // Delete no search results message if any
  $("#no-search-results").remove();

  // Reload initial chat bots from API
  loadInitialChatBots();
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

// Simulate API call to load more chat bots
async function loadMoreChatBots() {
  if (isLoading || !hasMore) return;

  if (
    !window.ChatBotAPI ||
    typeof window.ChatBotAPI.getChatBots !== "function"
  ) {
    console.error("ChatBotAPI.getChatBots is not available");
    return;
  }

  isLoading = true;
  showLoadingIndicator();

  try {
    const nextPage = currentPage + 1;
    const { data: newBots, hasMore: more } =
      await window.ChatBotAPI.getChatBotAdmin({
        page: nextPage,
        limit: itemsPerPage,
      });

    if (Array.isArray(newBots) && newBots.length > 0) {
      chatBots = [...chatBots, ...newBots];
      currentPage = nextPage;
      hasMore = Boolean(more);

      appendChatBotItems(newBots);

      if (!hasMore) {
        showEndOfListMessage();
      }
    } else {
      hasMore = false;
      showEndOfListMessage();
    }
  } catch (error) {
    console.error("Error loading more chat bots:", error);
  } finally {
    isLoading = false;
    hideLoadingIndicator();
  }
}

// Show end of list message
function showEndOfListMessage() {
  // Check if message already exists
  if ($("#end-of-list-message").length > 0) return;

  const endMessage = `
    <div id="end-of-list-message" class="flex justify-center items-center py-4 text-sm text-gray-500">
      All chat bots displayed
    </div>
  `;
  $("#chat-bot-list").append(endMessage);
}

// Show loading indicator
function showLoadingIndicator() {
  const loadingHtml = `
    <div id="loading-more" class="flex justify-center items-center py-4">
      <div class="lds-dual-ring"></div>
      <span class="ml-2 text-sm text-gray-500">Loading more...</span>
    </div>
  `;
  $("#chat-bot-list").append(loadingHtml);
}

// Hide loading indicator
function hideLoadingIndicator() {
  $("#loading-more").remove();
}

// Open/Close tab (toggle chat)
function toggleChat() {
  // Check 'opacity-0' class to determine closed state
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
async function backToList() {
  showListScreen();
  // call api adminLeaveChat to leave chat
  try {
    if (
      !window.ChatBotAPI ||
      typeof window.ChatBotAPI.adminLeaveChat !== "function"
    ) {
      throw new Error("ChatBotAPI.adminLeaveChat is not available");
    }
    // call socket adminLeaveChat
    adminSocket.emit("admin:leave_session", {
      sessionId: currentChatBot.sessionId,
      adminId: "admin_789",
    });

    // const response = await window.ChatBotAPI.adminLeaveChat(
    //   currentChatBot.sessionId,
    //   {
    //     adminId: "admin_789",
    //   }
    // );
    // console.log("response leave chat", response);
  } catch (error) {
    console.error("Failed to leave chat:", error);
  }
}

// Render chat bots list
function renderChatBotList() {
  const $list = $("#chat-bot-list");
  $list.empty();

  // Delete no search results message if any
  $("#no-search-results").remove();
  $("#end-of-list-message").remove();
  console.log("chatBots", chatBots);
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
        data-bot-id="${bot._id}"
      >
        <div class="flex items-center">
          <div class="w-12 h-12 avatar-chat-list flex items-center justify-center flex-shrink-0 mr-3">
           <img src="https://sehanf.cafe24.com/web/product/medium/user.svg" alt="user-avatar" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[16px] font-semibold text-gray-800 truncate">${
              bot.userId
            }</h3>
            <p class="text-[14px] text-gray-600 truncate">${
              bot?.description || ""
            }</p>
          </div>
        </div>
      </div>
    `;

    $list.append(botItem);
  });

  // Attach click event to each item (using event delegation)
  $(document)
    .off("click", ".chat-bot-item")
    .on("click", ".chat-bot-item", async function () {
      const botId = $(this).data("bot-id");
      try {
        await selectChatBot(botId);
      } catch (error) {
        console.error("Error selecting chat bot:", error);
      }
    });
}

// Format date for display
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to compare dates
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
    // Format: "Monday, 15/01/2024"
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

// Check if two timestamps are on different days
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

// Render date divider (horizontal line)
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

function formatTime(timestamp) {
  if (!timestamp) {
    return "";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Generate fake messages for chat bot
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

  // Create fake messages with different timestamps
  // Some messages are days apart to test date divider
  // for (let i = count - 1; i >= 0; i--) {
  //   const isUser = i % 2 === 0;
  //   const messageText = isUser
  //     ? userMessages[i % userMessages.length]
  //     : botMessages[i % botMessages.length];

  //   // Create timestamp with different intervals
  //   // Some messages are 1 day apart, some are hours apart
  //   let timeDiff;
  //   if (i < 5) {
  //     // 5 most recent messages: minutes apart (today)
  //     timeDiff = i * 30 * 60000; // 30 minutes per message
  //   } else if (i < 15) {
  //     // Next 10 messages: hours apart (yesterday)
  //     timeDiff = (i - 5) * 2 * 60 * 60000 + 24 * 60 * 60000; // 2 hours per message, starting from yesterday
  //   } else {
  //     // Remaining messages: 1-2 days apart
  //     timeDiff = (i - 15) * 1.5 * 24 * 60 * 60000 + 3 * 24 * 60 * 60000; // 1.5 days apart
  //   }

  //   fakeMessages.push({
  //     sender: isUser ? "user" : "bot",
  //     text: messageText,
  //     timestamp: new Date(Date.now() - timeDiff).toISOString(),
  //   });
  // }

  return fakeMessages.reverse(); // Reverse so oldest messages are first
}

// Select chat bot
async function selectChatBot(botId) {
  const bot = chatBots.find((b) => b._id === botId);
  console.log("bot", bot, botId, chatBots);
  if (!bot) return;

  currentChatBot = bot;
  console.log("currentChatBot", messages);
  // Update active state in list
  $(".chat-bot-item").removeClass("active");
  $(`.chat-bot-item[data-bot-id="${botId}"]`).addClass("active");
  adminSocket.emit("client:join_session", {
    sessionId: currentChatBot.sessionId,
  });
  // Update chat window header
  updateChatWindowHeader(bot);

  // Switch to chat screen
  showChatScreen();

  // call socket adminJoinSession
  console.log("🔌 [Admin] Selecting chat bot, joining session:", {
    botId: bot?._id,
    sessionId: bot?.sessionId,
    hasSocket: !!adminSocket,
    socketConnected: adminSocket?.connected,
    socketId: adminSocket?.id,
  });

  if (!adminSocket) {
    console.error("❌ [Admin] Cannot join session - adminSocket is null");
    return;
  }

  if (!bot?.sessionId) {
    console.error(
      "❌ [Admin] Cannot join session - sessionId is missing:",
      bot
    );
    return;
  }

  console.log("📤 [Admin] Emitting admin:join_session event:", {
    sessionId: bot.sessionId,
    adminId: "admin_789",
  });

  // adminSocket.emit("admin:join_session", {
  //   sessionId: bot.sessionId,
  //   adminId: "admin_789",
  // });

  console.log("✅ [Admin] admin:join_session event emitted");

  await restoreMessages(bot?.sessionId, bot._id);

  // Initialize messages detail

  // if (messages[botId] && messages[botId].length > 0) {
  //   // If messages exist, restore them
  //   restoreMessages(botId);
  // } else {
  //   initializeChatMessages(botId);
  // }

  // Scroll to bottom
  setTimeout(() => {
    $messageArea.scrollTop($messageArea.prop("scrollHeight"));
  }, 100);
}

// Initialize messages for chat
function initializeChatMessages(botId) {
  // Create entire fake message history (30 messages)
  messageHistory[botId] = generateFakeMessages(botId, 30);

  // Initialize pagination
  // Track starting index of loaded messages (oldest unloaded message)
  messagePage[botId] = 0; // Index of oldest unloaded message
  hasMoreMessages[botId] = messageHistory[botId].length > messagesPerPage;
  isLoadingMessages[botId] = false;

  // Load initial messages (10 most recent messages)
  // Most recent messages are at the end of messageHistory
  const totalMessages = messageHistory[botId].length;
  const startIndex = Math.max(0, totalMessages - messagesPerPage);
  const initialMessages = messageHistory[botId].slice(startIndex);
  messages[botId] = [...initialMessages];
  // Update page index (oldest unloaded message is startIndex)
  messagePage[botId] = startIndex;

  // Render initial messages
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

// Update chat window header
function updateChatWindowHeader(bot) {
  const avatarColors = {
    indigo: "bg-indigo-100 text-indigo-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const avatarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  `;

  $("#chat-header-avatar")
    .removeClass()
    .addClass(
      `w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md`
    )
    .html(avatarSvg);

  $("#chat-header-title").text(bot.userId);
}

// Restore messages
async function restoreMessages(sessionId, botId) {
  if (!sessionId || !botId) return;
  if (
    !window.ChatBotAPI ||
    typeof window.ChatBotAPI.getChatSessionMessageDetail !== "function"
  ) {
    console.warn("ChatBotAPI.getChatSessionMessageDetail is not available");
    return;
  }

  $messageArea.empty();

  try {
    const response = await window.ChatBotAPI.getChatSessionMessageDetail(
      sessionId
    );
    //   [
    //     {
    //         "_id": "691c2d239cfad509ace301e1",
    //         "sessionId": "f2e46ea5-3d74-45c3-9f24-f2fa1cbe2573",
    //         "storeId": "sehanf",
    //         "messageType": "user",
    //         "content": "Hello, I need help with my order",
    //         "userId": "user_456",
    //         "status": "sent",
    //         "metadata": {
    //             "source": "web",
    //             "device": "desktop"
    //         },
    //         "createdAt": "2025-11-18T08:24:03.005Z",
    //         "updatedAt": "2025-11-18T08:24:03.005Z",
    //         "__v": 0
    //     }
    // ]
    console.log("response detail", response);
    let sessionMessages = [];

    messages[botId] = response;

    response.forEach((msg, index) => {
      const previousMsg = index > 0 ? response[index - 1] : null;
      const previousTimestamp = previousMsg ? previousMsg.timestamp : null;
      appendMessage(
        msg.messageType,
        msg.content || "",
        msg.createdAt || new Date().toISOString(),
        false,
        previousTimestamp
      );
    });
  } catch (error) {
    console.error("Failed to restore messages:", error);
  }

  $messageArea.scrollTop($messageArea.prop("scrollHeight"));
}

// Handle scroll to load older messages
function handleMessageScroll() {
  const scrollTop = $messageArea.scrollTop();

  // If scrolled near top (200px remaining) then load older messages
  if (
    scrollTop < 200 &&
    currentChatBot &&
    hasMoreMessages[currentChatBot.id] &&
    !isLoadingMessages[currentChatBot.id]
  ) {
    loadMoreMessages();
  }
}

// Load older messages
async function loadMoreMessages() {
  if (!currentChatBot) return;

  const botId = currentChatBot.id;
  if (isLoadingMessages[botId] || !hasMoreMessages[botId]) return;

  isLoadingMessages[botId] = true;
  showMessageLoadingIndicator();

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Calculate old messages to load
    // messagePage[botId] is the index of the oldest unloaded message
    const startIndex = messagePage[botId] || 0;
    const loadCount = Math.min(messagesPerPage, startIndex);

    if (loadCount > 0) {
      // Load old messages from messageHistory
      const endIndex = startIndex;
      const newStartIndex = Math.max(0, startIndex - messagesPerPage);
      const oldMessages = messageHistory[botId].slice(newStartIndex, endIndex);

      if (oldMessages.length > 0) {
        // Save current scroll position
        const oldScrollHeight = $messageArea.prop("scrollHeight");
        const oldScrollTop = $messageArea.scrollTop();

        // Prepend old messages to beginning of messages (oldest messages first)
        messages[botId] = [...oldMessages, ...messages[botId]];

        // Update page index
        messagePage[botId] = newStartIndex;

        // Render old messages (reverse to display in correct order from top to bottom)
        // Oldest messages render first, then newer messages
        const firstExistingMsg =
          messages[botId] && messages[botId].length > 0
            ? messages[botId][0]
            : null;
        const firstExistingTimestamp = firstExistingMsg
          ? firstExistingMsg.timestamp
          : null;

        // Reverse oldMessages to render from oldest to newest
        const reversedOldMessages = [...oldMessages].reverse();
        reversedOldMessages.forEach((msg, index) => {
          // Next message is newer (index + 1) or first existing message
          const nextMsg =
            index < reversedOldMessages.length - 1
              ? reversedOldMessages[index + 1]
              : firstExistingMsg;
          const nextTimestamp = nextMsg ? nextMsg.timestamp : null;
          prependMessage(msg.sender, msg.text, msg.timestamp, nextTimestamp);
        });

        // Restore scroll position
        const newScrollHeight = $messageArea.prop("scrollHeight");
        const scrollDiff = newScrollHeight - oldScrollHeight;
        $messageArea.scrollTop(oldScrollTop + scrollDiff);

        // Check if there are more messages
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
    console.error("Error loading more messages:", error);
  } finally {
    isLoadingMessages[botId] = false;
    hideMessageLoadingIndicator();
  }
}

// Prepend message to beginning (to display old messages)
function prependMessage(sender, text, timestamp = null, nextTimestamp = null) {
  const isUser = sender === "user";
  const isAdmin = sender === "admin";
  const formattedText = text.replace(/\n/g, "<br>");
  const currentTimestamp = timestamp || new Date().toISOString();

  // Check if date divider needs to be displayed (after this message)
  let dateDividerHtml = "";
  if (nextTimestamp && isDifferentDay(currentTimestamp, nextTimestamp)) {
    dateDividerHtml = renderDateDivider(nextTimestamp);
  }

  // Avatar for bot
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
      <img src="https://sehanf.cafe24.com/web/product/medium/bot-avatar.svg" alt="ai-avatar" />
    </div>
  `;

  // Avatar for Admin is text
  const adminAvatar = `
  <span class="text-xs bg-[#00000010] p-2 rounded-lg font-semibold text-blue-600 mb-1 block">관리자</span>
  `;

  // Avatar for User
  const userAvatar = `
    <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
           <img src="https://sehanf.cafe24.com/web/product/medium/user.svg" alt="user-avatar" />
    </div>
  `;

  const avatarHtml = isUser ? userAvatar : isAdmin ? adminAvatar : botAvatar;
  const bubbleClass = isUser
    ? "bg-white text-gray-800"
    : "background-main-color text-white";
  const timeAlignmentClass = isUser ? "text-left" : "text-right";

  const timeText = formatTime(currentTimestamp);
  const timeHtml = timeText
    ? `
    <div class="text-[11px] text-gray-400 mt-1 ${timeAlignmentClass}">
      ${timeText}
    </div>
  `
    : "";

  const contentHtml = isUser
    ? `
    <div class="flex justify-start items-end gap-2">
      ${avatarHtml}
      <div class="max-w-[80%] p-3 rounded-xl shadow-sm text-sm ${bubbleClass}">
        ${formattedText}
      </div>
    </div>
  `
    : `
    <div class="flex justify-end items-end gap-2">
      <div class="max-w-[80%] p-3 rounded-xl shadow-sm text-sm ${bubbleClass}">
        ${formattedText}
      </div>
      ${avatarHtml}
    </div>
  `;

  const messageHtml = `
    ${contentHtml}
    ${timeHtml}
    ${dateDividerHtml}
  `;

  // Prepend to beginning of message area
  $messageArea.prepend(messageHtml);
}

// Show loading indicator for messages
function showMessageLoadingIndicator() {
  const loadingHtml = `
    <div id="loading-messages" class="flex justify-center items-center py-2">
      <div class="lds-dual-ring"></div>
      <span class="ml-2 text-xs text-gray-500">Loading...</span>
    </div>
  `;
  $messageArea.prepend(loadingHtml);
}

// Hide loading indicator for messages
function hideMessageLoadingIndicator() {
  $("#loading-messages").remove();
}

// Add message to chat frame
function appendMessage(
  sender,
  text,
  timestamp = null,
  saveToHistory = true,
  previousTimestamp = null
) {
  const isUser = sender === "user";
  const isAdmin = sender === "admin";
  const formattedText = text.replace(/\n/g, "<br>");
  const currentTimestamp = timestamp || new Date().toISOString();

  // Check if date divider needs to be displayed
  let dateDividerHtml = "";
  if (
    previousTimestamp &&
    isDifferentDay(currentTimestamp, previousTimestamp)
  ) {
    dateDividerHtml = renderDateDivider(currentTimestamp);
  }

  // Avatar for bot (based on current bot)
  let botAvatarClass = "bg-indigo-100 text-indigo-600";
  if (currentChatBot) {
    const avatarColors = {
      green: "bg-green-100 text-green-600",
    };
    botAvatarClass = avatarColors[currentChatBot.avatar] || botAvatarClass;
  }

  const adminAvatar = `
    <span class="text-xs font-semibold p-2 rounded-lg bg-[#00000010] text-black-600">관리자</span>
  `;

  const botAvatar = `
    <div class="w-8 h-8 rounded-lg chat-bot-around flex items-center justify-center flex-shrink-0">
      <img src="https://sehanf.cafe24.com/web/product/medium/bot-avatar.svg" alt="bot-avatar" />
    </div>
  `;

  const userAvatar = `
    <div class="w-8 h-8 rounded-lg bg-[gray-600] flex items-center justify-center flex-shrink-0">
      <img src="https://sehanf.cafe24.com/web/product/medium/user.svg" alt="user-avatar" />
    </div>
  `;

  const avatarHtml = isUser ? userAvatar : isAdmin ? adminAvatar : botAvatar;
  const bubbleClass = isUser
    ? "bg-white text-gray-800"
    : "background-main-color text-white";
  const timeAlignmentClass = isUser ? "text-left" : "text-right";

  const timeText = formatTime(currentTimestamp);
  const timeHtml = timeText
    ? `
    <div class="text-[11px] text-gray-400 mt-1 ${timeAlignmentClass}">
      ${timeText}
    </div>
  `
    : "";
  console.log("isAdmin", formattedText, isAdmin, isUser);

  const contentHtml = isUser
    ? `
    <div class="flex justify-start items-end gap-2">
      ${avatarHtml}
      <div class="max-w-[80%] p-3 rounded-xl shadow-sm text-sm ${bubbleClass}">
        <div>${formattedText}</div>
        ${timeHtml}
      </div>
    </div>
  `
    : `
    <div class="flex justify-end items-end gap-2">
      <div class="max-w-[80%] p-3 rounded-xl shadow-sm text-sm ${bubbleClass}">
        <div>${formattedText}</div>
        ${timeHtml}
      </div>
      ${avatarHtml}
    </div>
  `;

  const messageHtml = `
    ${dateDividerHtml}
    ${contentHtml}
  `;

  $messageArea.append(messageHtml);
  $messageArea.scrollTop($messageArea.prop("scrollHeight"));

  // Save to history
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

// Show loading indicator
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

// Remove loading indicator
function removeLoadingIndicator() {
  $("#loading-indicator").remove();
}

// Send message
async function sendMessage() {
  if (!currentChatBot) {
    // Open tab if not open
    if ($chatTab.hasClass("opacity-0")) {
      toggleChat();
    }
    return;
  }

  const userText = $chatInput.val().trim();
  if (userText === "") return;

  // Disable input/button
  $chatInput.prop("disabled", true);
  $sendButton.prop("disabled", true);

  // Get last message to check date divider
  const botId = currentChatBot._id;
  const lastMessage =
    messages[botId] && messages[botId].length > 0
      ? messages[botId][messages[botId].length - 1]
      : null;
  const previousTimestamp = lastMessage ? lastMessage.timestamp : null;
  const currentTimestamp = new Date().toISOString();

  // Display user message
  appendMessage("admin", userText, currentTimestamp, true, previousTimestamp);
  $chatInput.val("");

  // Show loading
  // appendLoadingIndicator();

  // call api sendMessageToChatSession, adminJoinChat to send message, after that call api get message detail to update list chat
  try {
    if (!adminSocket) {
      console.error("❌ [Admin] Cannot send message - adminSocket is null");
      return;
    }

    if (!currentChatBot?.sessionId) {
      console.error("❌ [Admin] Cannot send message - sessionId is missing");
      return;
    }

    const messagePayload = {
      sessionId: currentChatBot.sessionId,
      content: userText,
      metadata: { source: "websocket-test" },
    };

    console.log("📤 [Admin] Emitting client:message event:", messagePayload);
    adminSocket.emit("client:message", messagePayload);
    console.log("✅ [Admin] client:message event emitted");
    // const response = await window.ChatBotAPI.sendMessageToChatSession(
    //   currentChatBot.sessionId,
    //   {
    //     content: userText,
    //     userId: "admin_789",
    //     metadata: {
    //       source: "web",
    //       device: "desktop",
    //     },
    //   }
    // );
    // console.log("response send message", response);
  } catch (error) {
    console.error("Failed to send message:", error);
  } finally {
    // Restore input/button
    $chatInput.prop("disabled", false);
    $sendButton.prop("disabled", false);
    $chatInput.focus();
  }
  // try {
  //   if (
  //     !window.ChatBotAPI ||
  //     typeof window.ChatBotAPI.getLLMResponse !== "function"
  //   ) {
  //     throw new Error("ChatBotAPI.getLLMResponse is not available");
  //   }

  //   // Call API
  //   const botResponse = await window.ChatBotAPI.getLLMResponse(
  //     userText,
  //     currentChatBot
  //   );

  //   // Remove loading and display response
  //   removeLoadingIndicator();
  //   const botTimestamp = new Date().toISOString();
  //   appendMessage("bot", botResponse, botTimestamp, true, currentTimestamp);

  //   // SIMULATE ORDER CREATION API CALL (IF ORDER INTENT DETECTED)
  //   // if (
  //   //   (userText.toLowerCase().includes("create order") ||
  //   //     userText.toLowerCase().includes("place order")) &&
  //   //   currentChatBot.id === "b2b-ai"
  //   // ) {
  //   //   setTimeout(() => {
  //   //     const orderTimestamp = new Date().toISOString();
  //   //     appendMessage(
  //   //       "bot",
  //   //       `✅ **ORDER CREATED SUCCESSFULLY (Simulated):** Order Code (eCount) is **EC-100023**. Would you like to see more products?`,
  //   //       orderTimestamp,
  //   //       true,
  //   //       botTimestamp
  //   //     );
  //   //   }, 1500); // Simulated order creation delay
  //   // }
  // } catch (error) {
  //   removeLoadingIndicator();
  //   const errorTimestamp = new Date().toISOString();
  //   const lastMsg =
  //     messages[botId] && messages[botId].length > 0
  //       ? messages[botId][messages[botId].length - 1]
  //       : null;
  //   const lastTimestamp = lastMsg ? lastMsg.timestamp : currentTimestamp;
  //   appendMessage(
  //     "bot",
  //     `An error occurred: ${error.message}`,
  //     errorTimestamp,
  //     true,
  //     lastTimestamp
  //   );
  // } finally {
  //   // Restore input/button
  //   $chatInput.prop("disabled", false);
  //   $sendButton.prop("disabled", false);
  //   $chatInput.focus();
  // }
  try {
    if (
      !window.ChatBotAPI ||
      typeof window.ChatBotAPI.sendMessageToChatSession !== "function"
    ) {
      throw new Error("ChatBotAPI.sendMessageToChatSession is not available");
    }
  } catch (error) {
    console.error("Failed to send message:", error);
  } finally {
    // Restore input/button
    $chatInput.prop("disabled", false);
    $sendButton.prop("disabled", false);
    $chatInput.focus();
  }
}

async function getToken() {
  try {
    if (
      !window.ChatBotAPI ||
      typeof window.ChatBotAPI.getToken !== "function"
    ) {
      throw new Error("ChatBotAPI.getToken is not available");
    }
    const response = await window.ChatBotAPI.getToken();
    if (!response) {
      throw new Error("Failed to get token: No token returned");
    }
    console.log("response token", response);
  } catch (error) {
    console.error("Failed to get token:", error);
    throw error;
  }
}

// ============================================
// ADMIN SOCKET LOGIC
// ============================================

let adminSocket = null;
let isAdminSocketInitialized = false;
let adminConfig = {};
let refreshSessionListTimeout = null;
const REFRESH_DEBOUNCE_MS = 500; // 500ms debounce

// Initialize admin socket
function initializeAdminSocket(config = {}) {
  if (isAdminSocketInitialized) {
    return adminSocket;
  }

  if (!window.io || typeof window.io !== "function") {
    return null;
  }

  adminConfig = {
    endpoint: config.endpoint || SOCKET_ENDPOINT,
    userId: null,
    adminId: config.adminId,
    storeId: config.storeId,
    sessionId: null,
  };

  const socketOptions = {
    transports: ["websocket"],
    auth: {
      userId: null,
      adminId: adminConfig.adminId,
      storeId: adminConfig.storeId,
      userType: "admin",
    },
  };

  adminSocket = window.io(adminConfig.endpoint, socketOptions);
  console.log("🔌 [Admin] Socket initialized:", {
    socket: adminSocket,
    endpoint: adminConfig.endpoint,
    config: adminConfig,
    socketOptions: socketOptions,
  });
  window.AdminChatBotSocket = adminSocket;

  bindAdminSocketEvents();
  isAdminSocketInitialized = true;

  console.log("✅ [Admin] Socket events bound, waiting for connection...");
  return adminSocket;
}

// Bind admin socket events
function bindAdminSocketEvents() {
  if (!adminSocket) {
    console.error("❌ [Admin] Cannot bind events - adminSocket is null");
    return;
  }

  console.log("🔌 [Admin] Binding socket events...");

  adminSocket.on("connect", handleAdminSocketConnect);
  console.log("✅ [Admin] connect event listener registered");

  adminSocket.on("disconnect", handleAdminSocketDisconnect);
  console.log("✅ [Admin] disconnect event listener registered");

  adminSocket.on("error", handleAdminSocketError);
  console.log("✅ [Admin] error event listener registered");

  // listen session created event
  adminSocket.on("server:session_created", (data) => {
    console.log("📥 [Admin] server:session_created event received:", {
      fullData: data,
      sessionId: data?.sessionId,
    });
    refreshAdminSessionList();
  });
  console.log("✅ [Admin] server:session_created event listener registered");

  // listen server when have new user message use admin:new_session
  adminSocket.on("server:new_session", (data) => {
    console.log("server:new_session event received:", data);
    const { sessionId } = data;
    console.log("sessionId", sessionId);
    refreshAdminSessionList();
  });
  console.log("✅ [Admin] server:new_session event listener registered");

  adminSocket.on("server:message", (data) => {
    console.log("server:message event received:", data);
    const { message } = data;
    console.log("message", message, data);
    if (
      currentChatBot &&
      message?.sessionId === currentChatBot.sessionId &&
      message &&
      message.messageType !== "admin"
    ) {
      appendMessage(message.messageType, message.content, message.createdAt);
      // Scroll to bottom after adding new message
      setTimeout(() => {
        $messageArea.scrollTop($messageArea.prop("scrollHeight"));
      }, 100);
      console.log("✅ [Admin] Message added and scrolled");
    } else {
      console.log("⚠️ [Admin] Message ignored - conditions not met");
    }
  });

  console.log("✅ [Admin] server:message event listener registered");

  if (typeof adminSocket.onAny === "function") {
    // adminSocket.onAny((eventName, ...args) => {
    //   console.log(`📡 [Admin] Any socket event received "${eventName}":`, {
    //     eventName: eventName,
    //     args: args,
    //     firstArg: args[0],
    //   });
    //   const { message } = args[0];
    //   console.log("message111", message, args);
    //   if (
    //     currentChatBot &&
    //     message?.sessionId === currentChatBot.sessionId &&
    //     message &&
    //     message.messageType !== "admin"
    //   ) {
    //     appendMessage(message.messageType, message.content, message.createdAt);

    //     // Scroll to bottom after adding new message
    //     setTimeout(() => {
    //       $messageArea.scrollTop($messageArea.prop("scrollHeight"));
    //     }, 100);

    //     console.log("✅ [Admin] Message added and scrolled");
    //   } else {
    //     console.log("⚠️ [Admin] Message ignored - conditions not met");
    //   }
    // });
    console.log("✅ [Admin] onAny event listener registered");
  } else {
    console.warn("⚠️ [Admin] onAny function not available on socket");
  }

  console.log("✅ [Admin] All socket events bound successfully");
}

// Handle admin socket connect
function handleAdminSocketConnect() {
  console.log("✅ [Admin] Socket connected to server:", {
    socketId: adminSocket?.id,
    connected: adminSocket?.connected,
    adminConfig: adminConfig,
  });

  // Join admin room/store room khi connect để nhận tất cả events
  if (adminSocket) {
    console.log(
      "🔌 [Admin] Emitting admin:join to store room:",
      adminConfig.storeId
    );
    adminSocket.emit("admin:join", {
      storeId: adminConfig.storeId || "store_test_001",
    });
    console.log("✅ [Admin] admin:join event emitted");
  } else {
    console.error("❌ [Admin] Cannot join store room - socket is null");
  }
}

// Handle admin socket disconnect
function handleAdminSocketDisconnect(reason) {
  console.log("🔌 [Admin] Socket disconnected:", {
    reason: reason,
    socketId: adminSocket?.id,
    wasConnected: adminSocket?.connected,
  });
}

// Handle admin socket error
function handleAdminSocketError(error) {
  console.error("❌ [Admin] Socket.IO error:", {
    error: error,
    errorMessage: error?.message,
    errorStack: error?.stack,
    socketId: adminSocket?.id,
    socketConnected: adminSocket?.connected,
  });
}

// Refresh admin session list with debounce
function refreshAdminSessionList() {
  if (refreshSessionListTimeout) {
    clearTimeout(refreshSessionListTimeout);
  }
  refreshSessionListTimeout = setTimeout(() => {
    const $listScreen = $("#list-screen");
    if ($listScreen && $listScreen.hasClass("active")) {
      console.log("🔄 [Admin] Refreshing session list...");
      if (typeof loadInitialChatBots === "function") {
        loadInitialChatBots();
      } else {
        console.warn("⚠️ [Admin] loadInitialChatBots function not found");
      }
    }
  }, REFRESH_DEBOUNCE_MS);
}
