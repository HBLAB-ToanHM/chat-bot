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

  // Check if token exists in URL params (after OAuth callback redirect)
  function checkTokenInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    
    if (token) {
      console.log("🔑 [checkTokenInUrl] Token found in URL, saving...");
      localStorage.setItem("token", token);
      // Clean up URL - remove token param
      window.history.replaceState({}, document.title, window.location.pathname);
      return token;
    }
    return null;
  }

  // Flag to prevent multiple exchange calls
  let isExchangingCode = false;

  // Cafe24 OAuth credentials
  const CAFE24_CLIENT_ID = "WfkRlLSXCK7THVuIdJis7G";
  const CAFE24_CLIENT_SECRET = "OneQI9xaeEmpGCpPWzfwkF";  // ⚠️ WARNING: Exposed in frontend!
  const CAFE24_REDIRECT_URI = "https://capable-lamington-043ff3.netlify.app/";
  const CAFE24_MALL_ID = "sehanf";

  // Exchange authorization code for token via Cafe24 API directly
  // ⚠️ WARNING: This exposes client_secret in browser - use backend in production!
  async function exchangeCodeForToken(code) {
    // Prevent multiple calls
    if (isExchangingCode) {
      console.log("🔄 [exchangeCode] Already exchanging, skipping...");
      return null;
    }
    isExchangingCode = true;
    
    console.log("🔄 [exchangeCode] Calling Cafe24 token API directly...");
    
    try {
   const apiGetTokenUrl = 'https://api-heasung.hblab.dev/api/v1/auth/cafe24/callback?code=' + code + '&state=store_12345&error=access_denied&error_description=Client_id%2Bis%2Bnot%2Bregistered';      
      const response = await fetch(
        apiGetTokenUrl,
        {
          method: "GET",
        }
      );
      console.log('data', response);
      const data = await response.json();
      console.log('data2', data);
      return data?.access_token;

     
    } catch (error) {
      console.error("❌ [exchangeCode] Error:", error);
      return null;
    } finally {
      isExchangingCode = false;
    }
  }

  async function getToken() {
    console.log("🔑 [getToken] Starting getToken...");
     const authorizeUrl = 'https://api-heasung.hblab.dev/api/v1/auth/cafe24/authorize?storeId=sehanf';
    
    window.location.href = authorizeUrl;

     const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    console.log('codeee', code);
    console.log('state', state);
    return;
    // Step 1: Check localStorage
    let token = localStorage.getItem("token");
    if (token) {
      console.log("🔑 [getToken] Token found in localStorage");
      return token;
    }

    // Step 2: Check URL for token (from backend redirect)
    token = checkTokenInUrl();
    if (token) {
      console.log("🔑 [getToken] Token found in URL params");
      return token;
    }

    // Step 3: Check URL for authorization code (from Cafe24 redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    
    if (code) {
      console.log("🔑 [getToken] Authorization code found:", code);
      
      // Clean up URL IMMEDIATELY to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Exchange code for token via backend
      token = await exchangeCodeForToken(code);
      
      if (token) {
        localStorage.setItem("token", token);
        console.log("✅ [getToken] Token saved successfully");
        return token;
      } else {
        console.error("❌ [getToken] Failed to exchange code for token");
        // Don't redirect again - let user retry manually
        return null;
      }
    }

    // Step 4: No token AND no code, redirect to Cafe24 OAuth
    console.log("🔑 [getToken] No token/code found, redirecting to Cafe24...");
    const authorizeUrl = 'https://sehanf.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=WfkRlLSXCK7THVuIdJis7G&state=1734262400000&redirect_uri=https%3A%2F%2Fcapable-lamington-043ff3.netlify.app%2F&scope=mall.read_store%2Cmall.read_product%2Cmall.read_category%2Cmall.read_customer';
    
    window.location.href = authorizeUrl;
    return null; // Page will redirect
    
    // // Step 3: No token, redirect to backend authorize endpoint
    // // IMPORTANT: Use redirect, NOT fetch() - OAuth authorize doesn't allow CORS
    // console.log("🔑 [getToken] No token found, redirecting to authorize...");
    
    // // Encode frontend callback URL so backend knows where to redirect after OAuth
    // const callbackUrl = encodeURIComponent(window.location.href);
    // const authorizeUrl = `https://api-heasung.hblab.dev/api/v1/auth/cafe24/authorize?storeId=sehanf&callback=${callbackUrl}`;
    
    // console.log("🔑 [getToken] Redirecting to:", authorizeUrl);
    // window.location.href = authorizeUrl;  // ← REDIRECT, không phải fetch()
    
    // return null; // Page will redirect, code won't continue
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
