/**
 * Digital Twin Agent System
 * Minimal agent system using vanilla JavaScript and h.dataplan.top API
 *
 * Features:
 * - Multi-agent architecture based on expertise areas
 * - Automatic agent selection based on keywords
 * - Vanilla JS (no dependencies)
 * - Easy integration with existing chatbot
 */

class DigitalTwinAgent {
  constructor(config = {}) {
    this.apiEndpoint = config.apiEndpoint || 'https://h.dataplan.top/';
    this.model = config.model || 'Qwen/Qwen3-235B-A22B-Instruct-2507-tput';
    this.agents = [];
    this.conversationHistory = [];
    this.currentAgent = null;
    this.debug = config.debug || false;
  }

  /**
   * Load agent definitions from JSON
   */
  async loadAgents(agentsData) {
    if (typeof agentsData === 'string') {
      // If URL provided, fetch it
      const response = await fetch(agentsData);
      const data = await response.json();
      this.agents = data.agents;
      this.agentSelectionRules = data.agent_selection_rules;
    } else {
      // If object provided directly
      this.agents = agentsData.agents;
      this.agentSelectionRules = agentsData.agent_selection_rules;
    }

    if (this.debug) {
      console.log(`Loaded ${this.agents.length} agents:`, this.agents.map(a => a.name));
    }

    return this.agents;
  }

  /**
   * Select the most appropriate agent based on user message
   */
  selectAgent(userMessage) {
    const messageLower = userMessage.toLowerCase();
    let bestAgent = null;
    let maxScore = 0;

    // Check each agent's trigger keywords
    for (const agent of this.agents) {
      let score = 0;

      // Skip general assistant initially
      if (agent.id === this.agentSelectionRules.default_agent) {
        continue;
      }

      // Count keyword matches
      for (const keyword of agent.trigger_keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestAgent = agent;
      }
    }

    // If no matches or score too low, use default agent
    if (maxScore === 0) {
      bestAgent = this.agents.find(a => a.id === this.agentSelectionRules.default_agent);
    }

    this.currentAgent = bestAgent;

    if (this.debug) {
      console.log(`Selected agent: ${bestAgent.name} (score: ${maxScore})`);
    }

    return bestAgent;
  }

  /**
   * Call the API with the selected agent's system prompt
   */
  async callAPI(userMessage, agent = null, onChunk = null) {
    const selectedAgent = agent || this.currentAgent || this.selectAgent(userMessage);

    try {
      const messages = [
        {
          role: "system",
          content: selectedAgent.system_prompt
        },
        {
          role: "user",
          content: userMessage
        }
      ];

      const requestBody = {
        model: this.model,
        messages: messages,
        max_tokens: Math.min(selectedAgent.max_tokens || 2000, 2000),  // Limit to 2000 tokens max
        temperature: selectedAgent.temperature || 0.7,
        stream: onChunk ? true : false  // Enable streaming if callback provided
      };

      if (this.debug) {
        console.log('API Request:', requestBody);
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      if (onChunk && response.body) {
        return await this.handleStreamingResponse(response, selectedAgent, onChunk);
      }

      // Handle non-streaming response
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API error occurred');
      }

      const botResponse = data.choices[0].message.content;

      if (this.debug) {
        console.log('API Response:', botResponse);
      }

      return {
        response: botResponse,
        agent: selectedAgent,
        usage: data.usage
      };

    } catch (error) {
      console.error('API Error:', error);
      return {
        response: this.getFallbackResponse(userMessage),
        agent: selectedAgent,
        error: error.message
      };
    }
  }

  /**
   * Handle streaming response from API
   */
  async handleStreamingResponse(response, agent, onChunk) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                const chunk = parsed.choices[0].delta.content;
                fullResponse += chunk;

                // Call the chunk callback
                if (onChunk) {
                  onChunk(chunk, fullResponse);
                }
              }
            } catch (e) {
              // Skip malformed JSON
              if (this.debug) {
                console.log('Skipping malformed chunk:', data);
              }
            }
          }
        }
      }

      return {
        response: fullResponse,
        agent: agent,
        usage: null  // Streaming doesn't return usage stats
      };

    } catch (error) {
      console.error('Streaming error:', error);
      return {
        response: this.getFallbackResponse(''),
        agent: agent,
        error: error.message
      };
    }
  }

  /**
   * Process a message with automatic agent selection
   */
  async chat(userMessage, onChunk = null) {
    const agent = this.selectAgent(userMessage);
    return await this.callAPI(userMessage, agent, onChunk);
  }

  /**
   * Process a message with streaming support
   */
  async chatStream(userMessage, onChunk) {
    return await this.chat(userMessage, onChunk);
  }

  /**
   * Process a message with a specific agent
   */
  async chatWithAgent(userMessage, agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    return await this.callAPI(userMessage, agent);
  }

  /**
   * Get list of available agents
   */
  getAgents() {
    return this.agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      icon: agent.icon,
      description: agent.description
    }));
  }

  /**
   * Fallback responses when API fails
   */
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('dataplan')) {
      return "DataPLAN is an LLM-powered data management plan generator for plant sciences. Check out the <a href='https://www.mdpi.com/2306-5729/8/11/159' target='_blank'>publication</a>!";
    } else if (lowerMessage.includes('elab2arc')) {
      return "elab2arc converts free-text experimental protocols into standardized ARC-compliant Excel files using AI and NLP.";
    } else if (lowerMessage.includes('mcp')) {
      return "I developed an MCP server for DataPLAN that enables AI assistants like Claude to interact with DMP generation!";
    } else if (lowerMessage.includes('plant') || lowerMessage.includes('root')) {
      return "My plant sciences research includes CPlantBox (whole-plant modeling) and root system architecture studies.";
    } else {
      return "I'm having trouble connecting to my AI system. Please ask about DataPLAN, elab2arc, research data management, or plant sciences.";
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get current agent info
   */
  getCurrentAgent() {
    return this.currentAgent ? {
      id: this.currentAgent.id,
      name: this.currentAgent.name,
      icon: this.currentAgent.icon
    } : null;
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.DigitalTwinAgent = DigitalTwinAgent;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DigitalTwinAgent;
}
