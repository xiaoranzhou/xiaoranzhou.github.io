/**
 * Zustand-inspired State Manager for Vanilla JavaScript
 * Lightweight, reactive state management for the chatbot
 */

class ChatStateStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Update state and notify listeners
   */
  setState(partial) {
    const prevState = this.state;
    this.state = typeof partial === 'function'
      ? partial(this.state)
      : { ...this.state, ...partial };

    this.listeners.forEach(listener => listener(this.state, prevState));
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Selector pattern
   */
  select(selector) {
    return selector(this.state);
  }
}

/**
 * Create a chat state store
 */
function createChatStore() {
  const store = new ChatStateStore({
    // Chat state
    messages: [],
    isLoading: false,
    isStreaming: false,
    currentAgent: null,
    streamingMessageId: null,
    streamingText: '',

    // UI state
    isChatOpen: false,
    inputValue: '',

    // Agent state
    selectedAgentId: null,
    availableAgents: [],
  });

  // Actions
  const actions = {
    // Chat actions
    setLoading: (isLoading) => {
      store.setState({ isLoading, isStreaming: false });
    },

    startStreaming: (messageId, agent) => {
      store.setState({
        isLoading: false,
        isStreaming: true,
        streamingMessageId: messageId,
        streamingText: '',
        currentAgent: agent
      });
    },

    updateStreamingText: (text) => {
      store.setState({ streamingText: text });
    },

    finishStreaming: () => {
      store.setState({
        isStreaming: false,
        streamingMessageId: null,
        streamingText: ''
      });
    },

    addMessage: (message) => {
      store.setState(state => ({
        messages: [...state.messages, {
          id: Date.now(),
          timestamp: new Date(),
          ...message
        }]
      }));
    },

    // UI actions
    toggleChat: () => {
      store.setState(state => ({
        isChatOpen: !state.isChatOpen
      }));
    },

    setInputValue: (value) => {
      store.setState({ inputValue: value });
    },

    // Agent actions
    setCurrentAgent: (agent) => {
      store.setState({ currentAgent: agent });
    },

    setAvailableAgents: (agents) => {
      store.setState({ availableAgents: agents });
    },

    // Reset
    reset: () => {
      store.setState({
        isLoading: false,
        isStreaming: false,
        streamingMessageId: null,
        streamingText: '',
        inputValue: ''
      });
    }
  };

  return {
    getState: () => store.getState(),
    setState: (partial) => store.setState(partial),
    subscribe: (listener) => store.subscribe(listener),
    select: (selector) => store.select(selector),
    ...actions
  };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.createChatStore = createChatStore;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createChatStore };
}
