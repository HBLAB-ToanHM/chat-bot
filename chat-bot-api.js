/**
 * Chat bot API helper module.
 * Exposes a global `ChatBotAPI` object so that legacy scripts can access
 * centralized API calls without relying on module bundlers.
 */

// api get token: 'https://pleximetric-sharlene-unfitly.ngrok-free.dev/api/v1/auth/cafe24/authorize?storeId=sehanf'

(function registerChatBotAPI(global) {
  // const API_BASE_URL =
  // "https://pleximetric-sharlene-unfitly.ngrok-free.dev/api/v1/chat";
  // const API_BASE_URL = "http://172.16.11.18:8080/api/v1/chat";
  const API_BASE_URL = "https://api-heasung.hblab.dev/api/v1/chat";
  const FALLBACK_CHAT_BOTS = [
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

  function getFallbackBots(page, limit) {
    const pageIndex = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 4);
    const startIndex = (pageIndex - 1) * pageSize;
    const fallbackSlice = FALLBACK_CHAT_BOTS.slice(
      startIndex,
      startIndex + pageSize
    );
    const hasMore =
      startIndex + fallbackSlice.length < FALLBACK_CHAT_BOTS.length;
    return {
      data: fallbackSlice.map((bot) => ({ ...bot })),
      hasMore,
      total: FALLBACK_CHAT_BOTS.length,
    };
  }
  async function getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
      try {
        // use fetch handle result, if success, store token to localStorage
        const response = await fetch(
          "https://183.91.3.171/api/v1/auth/cafe24/authorize?storeId=sehanf",
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
              "Content-Type": "application/json",
            },
          }
        );
        console.log("response", response);
        // const fakeToken =
        //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZWhhbmYiLCJ0eXBlIjoic3RvcmUiLCJpYXQiOjE3NjM5NjgxMzEsImV4cCI6MTc2NTE3NzczMSwiYXVkIjoiY2FmZTI0LXN0b3JlcyIsImlzcyI6ImtwLTE3Mi1hcGkifQ.Xv3Q2_bY9NM6dnUvz8gzBWt2JKqVho9fKyCZthRT_KM";
        // localStorage.setItem("token", fakeToken);
        // return fakeToken;
        if (!response.ok) {
          throw new Error(
            `Failed to get token: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        console.log("token get from api", data);
        if (data && data?.data?.token) {
          localStorage.setItem("token", data.token);
          return data.token;
        } else {
          throw new Error("Token not found in response data");
        }
      } catch (error) {
        console.error("Error getting token:", error);
        throw error;
      }
    } else {
      return token;
    }
  }
  async function parseChatBotResponse(response, page, limit) {
    if (!response.ok) {
      throw new Error(`Failed to fetch chat bots: ${response.status}`);
    }

    const payload = await response.json();
    let bots = [];
    let hasMore = false;
    let total = 0;

    if (Array.isArray(payload)) {
      bots = payload;
      total = payload.length;
    } else if (payload && typeof payload === "object") {
      if (Array.isArray(payload.data)) {
        bots = payload.data;
      } else if (Array.isArray(payload.items)) {
        bots = payload.items;
      } else if (Array.isArray(payload.list)) {
        bots = payload.list;
      }

      hasMore = Boolean(payload.hasMore);

      if (typeof payload.total === "number") {
        total = payload.total;
      } else if (typeof payload.count === "number") {
        total = payload.count;
      }
    }

    if (!hasMore) {
      const pageIndex = Math.max(1, Number(page) || 1);
      const pageSize = Math.max(1, Number(limit) || 4);
      const computedTotal =
        pageIndex * pageSize -
        (pageSize - (Array.isArray(bots) ? bots.length : 0));
      total = total || Math.max(computedTotal, 0);
      hasMore = Array.isArray(bots) ? bots.length === pageSize : false;
    }

    return {
      data: Array.isArray(bots) ? bots : [],
      hasMore,
      total,
    };
  }

  async function getChatBots({ page = 1, limit = 20 } = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token is required");
    }
    const params = new URLSearchParams({
      userId: "user_456",
      storeId: "sehanf",
      page: String(page),
      limit: String(limit),
    });

    try {
      const url = `${API_BASE_URL}/sessions?${params}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "1",
        },
      });
      const data = await response.json();
      return data?.data?.sessions;
    } catch (error) {
      console.error("Error fetching chat bots:", error);
      return getFallbackBots(page, limit);
    }
  }

  // get chat bot admin
  // update search
  async function getChatBotAdmin({
    storeId = "sehanf",
    page = 1,
    limit = 20,
    search = "",
  } = {}) {
    const token = localStorage.getItem("token");
    console.log("token111", token);
    if (!token) {
      throw new Error("Token is required");
    }
    const params = new URLSearchParams({
      storeId: "sehanf",
      page: String(page),
      limit: String(limit),
      search: search,
    });

    try {
      const url = `${API_BASE_URL}/sessions/admin?${params}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "1",
        },
      });
      const data = await response.json();
      return data?.data?.sessions;
    } catch (error) {
      console.error("Error fetching chat bots:", error);
      return getFallbackBots(page, limit);
    }
  }

  // send message to chat session
  async function sendMessageToChatSession(id, payload) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/sessions/${id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to send message to chat session: ${response.status}`
      );
    }
    const res = await response.json();
    return res;
  }

  // get chat session message detail
  async function getChatSessionMessageDetail(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/sessions/${id}/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to get chat session message detail: ${response.status}`
      );
    }
    const responseData = await response.json();
    return responseData?.data?.messages;
  }

  // admin join chat
  async function adminJoinChat(sessionId, payload) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/takeover`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to admin join chat: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  }

  // admin leave chat
  async function adminLeaveChat(id, payload) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/sessions/${id}/end-takeover`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to admin leave chat: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  }

  // user create session
  async function userCreateSession(payload) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to user create session: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  }

  // user close chat
  async function userCloseChat(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/sessions/${id}/close`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to user close chat: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  }

  async function searchChatBots(searchTerm) {
    if (!searchTerm) {
      return getFallbackBots(1, FALLBACK_CHAT_BOTS.length).data;
    }

    const params = new URLSearchParams({
      q: searchTerm,
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat-bots/search?${params}`
      );
      if (!response.ok) {
        throw new Error(`Failed to search chat bots: ${response.status}`);
      }
      const payload = await response.json();
      if (Array.isArray(payload)) {
        return payload;
      }
      if (payload && Array.isArray(payload.data)) {
        return payload.data;
      }
      return [];
    } catch (error) {
      console.error("Error searching chat bots:", error);
      const lowerSearchTerm = searchTerm.toLowerCase();
      return FALLBACK_CHAT_BOTS.filter((bot) => {
        const nameMatch = bot.name.toLowerCase().includes(lowerSearchTerm);
        const descriptionMatch = bot.description
          .toLowerCase()
          .includes(lowerSearchTerm);
        return nameMatch || descriptionMatch;
      }).map((bot) => ({ ...bot }));
    }
  }

  async function fetchProductData(query) {
    if (!query) {
      return { status: "not_found" };
    }

    try {
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`${API_BASE_URL}/products?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch product data: ${response.status}`);
      }
      const payload = await response.json();
      if (payload && payload.status) {
        return payload;
      }
      return { status: "success", product_data: payload?.data || [] };
    } catch (error) {
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
  }

  async function getLLMResponse(userQuery, bot) {
    if (!bot) {
      throw new Error("Missing bot configuration");
    }

    const apiKey = bot.apiKey || "";
    const apiUrl = `${API_BASE_URL}/llm`;

    const productInfo = await fetchProductData(userQuery);
    let groundingContext = "";

    if (productInfo.status === "success" && productInfo.product_data?.length) {
      const product = productInfo.product_data[0];
      groundingContext = `Product data from eCount: Name: ${product.name}, Price: ${product.price} VND, Stock: ${product.stock}.`;
    } else {
      groundingContext = "No internal product data available for reference.";
    }

    let systemPrompt = "";
    if (bot.id === "b2b-ai") {
      systemPrompt = `You are a B2B sales assistant. Respond in Vietnamese, based on the following product data: ${groundingContext}. Always suggest automatic order creation.`;
    } else if (bot.id === "customer-support") {
      systemPrompt =
        "You are a professional customer support assistant. Respond in Vietnamese, helping customers enthusiastically and effectively.";
    } else if (bot.id === "sales-assistant") {
      systemPrompt =
        "You are a sales assistant. Respond in Vietnamese, consult on products, and help customers find suitable items.";
    } else {
      systemPrompt =
        "You are a technical support assistant. Respond in Vietnamese, answer technical questions clearly and thoroughly.";
    }

    const payload = {
      contents: [{ parts: [{ text: userQuery }], role: "user" }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      metadata: { botId: bot.id },
    };

    try {
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
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const result = await response.json();
      if (result?.content?.parts?.length) {
        return result.content.parts[0].text;
      }
      if (Array.isArray(result?.candidates) && result.candidates[0]) {
        return (
          result.candidates[0].content?.parts?.[0]?.text ||
          "Sorry, I didn't quite understand. Could you please clarify?"
        );
      }

      return "Sorry, I didn't quite understand. Could you please clarify?";
    } catch (error) {
      console.error("LLM API connection error:", error);
      return `[Connection Error] Sorry, I couldn't connect. Please check your network or try again later.`;
    }
  }

  global.ChatBotAPI = {
    getChatBots,
    searchChatBots,
    getLLMResponse,
    getChatSessionMessageDetail,
    adminJoinChat,
    adminLeaveChat,
    userCloseChat,
    getToken,
    sendMessageToChatSession,
    userCreateSession,
    getChatBotAdmin,
  };
})(window);
