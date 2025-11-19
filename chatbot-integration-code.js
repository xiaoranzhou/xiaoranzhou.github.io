/**
 * DataPLAN API Integration for Digital Twin Chatbot
 *
 * This file contains the updated JavaScript code to integrate h.dataplan.top API
 * into the existing chatbot in index.html (lines 1152-1382)
 *
 * INSTRUCTIONS:
 * Replace the existing getBotResponse() and sendMessage() functions in index.html
 * with the code below.
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

const DATAPLAN_API_CONFIG = {
  endpoint: 'https://h.dataplan.top/',
  defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  maxTokens: 250,
  temperature: 0.7,
  systemPrompt: `You are Xiaoran Zhou's AI digital twin, an expert assistant specializing in:
- AI applications for research data management
- LLM workflow integration and automation
- Research data standardization (ISA Framework, ARC Specification)
- Plant sciences and computational biology
- Tools: DataPLAN (LLM-powered DMP generator), elab2arc (AI protocol converter), DataPLAN MCP server

Background:
- Data Science Researcher at Forschungszentrum Jülich (IBG-4, Bioinformatics)
- Developed multiple AI-powered tools for research data management
- Published work on plant modeling and data management systems

Respond in a helpful, professional, and concise manner. Focus on these areas of expertise when answering questions.`
};

// Alternative faster model option
const FAST_MODEL = 'Qwen/Qwen2.5-7B-Instruct-Turbo';

// ============================================================================
// CORE API FUNCTION
// ============================================================================

/**
 * Call the DataPLAN API with a user message
 * @param {string} userMessage - The user's message
 * @param {string} model - Optional model override
 * @returns {Promise<string>} The AI's response
 */
async function callDataPlanAPI(userMessage, model = DATAPLAN_API_CONFIG.defaultModel) {
  try {
    const response = await fetch(DATAPLAN_API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: DATAPLAN_API_CONFIG.systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: DATAPLAN_API_CONFIG.maxTokens,
        temperature: DATAPLAN_API_CONFIG.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('API returned error:', data.error);
      throw new Error(data.error.message || 'API error occurred');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('DataPLAN API Error:', error);

    // Return fallback message on error
    return getFallbackResponse(userMessage);
  }
}

/**
 * Fallback response when API is unavailable
 * This maintains the old hardcoded behavior as a backup
 */
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('dataplan')) {
    return "DataPLAN is my flagship project - an AI-powered data management plan generator for plant sciences. It uses LLM workflows to automatically create comprehensive, compliant DMPs. Check out the <a href='https://www.mdpi.com/2306-5729/8/11/159' target='_blank'>publication</a>!";
  } else if (lowerMessage.includes('elab2arc')) {
    return "elab2arc uses AI and NLP to convert free-text experimental protocols into standardized ARC-compliant Excel files. Visit the <a href='https://github.com/nfdi4plants/elab2arc' target='_blank'>GitHub repository</a>!";
  } else if (lowerMessage.includes('mcp')) {
    return "I've developed a Model Context Protocol (MCP) server for DataPLAN that enables AI assistants like Claude to directly interact with DMP generation functionality!";
  } else if (lowerMessage.includes('research') || lowerMessage.includes('interest')) {
    return "My research focuses on AI applications for research data management in plant sciences. I develop tools leveraging LLMs for data standardization and protocol conversion.";
  } else if (lowerMessage.includes('publication')) {
    return "Key publications include DataPLAN (MDPI Data 2023), CPlantBox (in silico Plants 2020), and work on phloem anatomy and root architecture. Scroll up to see them all!";
  } else if (lowerMessage.includes('contact') || lowerMessage.includes('email')) {
    return "Reach me at <a href='mailto:a@xrzhou.com'>a@xrzhou.com</a> or on <a href='https://www.linkedin.com/in/xiaoranzhou/' target='_blank'>LinkedIn</a>!";
  } else {
    return "I'm having trouble connecting to my AI assistant right now, but I can still help! Ask me about DataPLAN, elab2arc, research data management, or plant sciences.";
  }
}

// ============================================================================
// UPDATED CHATBOT FUNCTIONS
// ============================================================================

/**
 * REPLACE the existing getBotResponse() function (around line 1329-1350 in index.html)
 *
 * This now calls the DataPLAN API instead of using hardcoded responses
 */
async function getBotResponse(message) {
  // Call the API
  const response = await callDataPlanAPI(message);
  return response;
}

/**
 * REPLACE the existing sendMessage() function (around line 1240-1256 in index.html)
 *
 * Updated to handle async API calls
 */
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();

  if (message) {
    addUserMessage(message);
    input.value = '';

    // Show typing indicator
    showTyping();

    // Get bot response (now async)
    const botReply = await getBotResponse(message);

    // Hide typing indicator
    hideTyping();
    addBotMessage(botReply);
  }
}

// ============================================================================
// ENHANCED VERSION WITH CONVERSATION HISTORY (OPTIONAL)
// ============================================================================

/**
 * OPTIONAL: Enhanced version that maintains conversation history
 * This provides better context-aware responses
 */

// Store conversation history
let conversationHistory = [
  {
    role: "system",
    content: DATAPLAN_API_CONFIG.systemPrompt
  }
];

/**
 * Enhanced API call with conversation history
 */
async function callDataPlanAPIWithHistory(userMessage, model = DATAPLAN_API_CONFIG.defaultModel) {
  try {
    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: userMessage
    });

    // Keep only last 10 messages (5 exchanges) to avoid token limits
    const recentHistory = conversationHistory.slice(-11); // 1 system + 10 messages

    const response = await fetch(DATAPLAN_API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: recentHistory,
        max_tokens: DATAPLAN_API_CONFIG.maxTokens,
        temperature: DATAPLAN_API_CONFIG.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('API returned error:', data.error);
      throw new Error(data.error.message || 'API error occurred');
    }

    const botResponse = data.choices[0].message.content;

    // Add bot response to history
    conversationHistory.push({
      role: "assistant",
      content: botResponse
    });

    return botResponse;
  } catch (error) {
    console.error('DataPLAN API Error:', error);

    // Remove the failed user message from history
    conversationHistory.pop();

    return getFallbackResponse(userMessage);
  }
}

/**
 * Enhanced getBotResponse with conversation history
 * Use this instead of the basic version if you want context-aware responses
 */
async function getBotResponseEnhanced(message) {
  return await callDataPlanAPIWithHistory(message);
}

// ============================================================================
// ADDITIONAL HELPER FUNCTIONS
// ============================================================================

/**
 * Clear conversation history (useful for "New Chat" button)
 */
function clearConversationHistory() {
  conversationHistory = [
    {
      role: "system",
      content: DATAPLAN_API_CONFIG.systemPrompt
    }
  ];
}

/**
 * Test API connection
 * Call this on page load to verify API is working
 */
async function testAPIConnection() {
  try {
    console.log('Testing DataPLAN API connection...');
    const response = await callDataPlanAPI('Hello');
    console.log('✅ API test successful:', response);
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
}

// Test on page load (optional)
// window.addEventListener('load', testAPIConnection);

// ============================================================================
// INTEGRATION NOTES
// ============================================================================

/*
 * STEP-BY-STEP INTEGRATION:
 *
 * 1. Add this entire file's content to the <script> section in index.html
 *    (around line 1152, before the existing functions)
 *
 * 2. Replace the old getBotResponse() function with the new async version
 *
 * 3. Replace the old sendMessage() function with the new async version
 *
 * 4. (Optional) Replace sendSuggestion() to use async:
 *    function sendSuggestion(suggestion) {
 *      document.getElementById('chatInput').value = suggestion;
 *      sendMessage(); // Already async now
 *    }
 *
 * 5. Test the chatbot to ensure it's working correctly
 *
 * ALTERNATIVE: Use the enhanced version with conversation history
 * - Just replace getBotResponse with getBotResponseEnhanced
 * - This will maintain context across multiple messages
 *
 * FALLBACK: If API fails, it automatically falls back to hardcoded responses
 */
