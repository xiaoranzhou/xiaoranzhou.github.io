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
    this.knowledgeBase = null;
    this.jsonata = typeof jsonata !== 'undefined' ? jsonata : null;
  }

  /**
   * Load knowledge base from JavaScript object (loaded via knowledge-base.js)
   */
  loadKnowledgeBase(knowledgeData) {
    this.knowledgeBase = knowledgeData;

    if (this.debug) {
      console.log('Knowledge base loaded:', this.knowledgeBase);
    }
    return true;
  }

  /**
   * Stage 1: Query knowledge base using JavaScript
   * Finds entities where ANY alias is contained in the user message
   */
  queryKnowledgeBase(userMessage) {
    if (!this.knowledgeBase) {
      return null;
    }

    const messageLower = userMessage.toLowerCase();
    const allResults = [];

    // Helper function to check if any alias matches
    const checkAliases = (aliases) => {
      if (!aliases) return false;
      for (const alias of aliases) {
        if (messageLower.includes(alias.toLowerCase())) {
          return true;
        }
      }
      return false;
    };

    // Check institutions
    if (this.knowledgeBase.institutions) {
      for (const inst of this.knowledgeBase.institutions) {
        if (checkAliases(inst.aliases)) {
          allResults.push(inst);
        }
      }
    }

    // Check projects
    if (this.knowledgeBase.projects) {
      for (const proj of this.knowledgeBase.projects) {
        if (checkAliases(proj.aliases)) {
          allResults.push(proj);
        }
      }
    }

    // Check publications
    if (this.knowledgeBase.publications) {
      for (const pub of this.knowledgeBase.publications) {
        if (checkAliases(pub.aliases)) {
          allResults.push(pub);
        }
      }
    }

    if (allResults.length > 0) {
      if (this.debug) {
        console.log('KB found:', allResults);
      }
      return allResults;
    }

    return null;
  }

  /**
   * Format KB results as context prompt
   */
  formatContextFromResults(results) {
    if (!results || results.length === 0) {
      return '';
    }

    let context = '\n\nVERIFIED KNOWLEDGE (use this information):\n\n';

    for (const item of results) {
      if (item.name) {
        context += `**${item.name}**\n`;
      }
      if (item.description) {
        context += `${item.description}\n`;
      }
      if (item.focus) {
        context += `Focus: ${item.focus}\n`;
      }
      if (item.research_areas && item.research_areas.length > 0) {
        context += `Research: ${item.research_areas.join(', ')}\n`;
      }
      if (item.publication) {
        context += `Publication: ${item.publication}\n`;
      }
      if (item.url) {
        context += `URL: ${item.url}\n`;
      }
      context += '\n';
    }

    context += 'IMPORTANT: Use only the above verified facts. Do not add unverified details.\n';

    return context;
  }

  /**
   * Stage 2: Check model confidence when KB has no match
   */
  async checkResponseConfidence(userMessage, agent) {
    const checkPrompt = `You are a confidence evaluator.

QUESTION: "${userMessage}"
AGENT EXPERTISE: ${agent.name} - ${agent.description}

Evaluate:
1. Do you have verified knowledge to answer this accurately?
2. Is this within the agent's expertise?

Respond ONLY with valid JSON:
{
  "confidence": 0.0-1.0,
  "can_answer": true/false,
  "reasoning": "brief explanation"
}`;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: checkPrompt }],
          max_tokens: 200,
          temperature: 0.1
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { confidence: 0.5, can_answer: true, reasoning: "Parse failed" };
    } catch (error) {
      console.error('Confidence check error:', error);
      return { confidence: 0.3, can_answer: false, reasoning: "Check failed" };
    }
  }

  /**
   * Fallback response for low-confidence situations
   */
  getUncertainResponse(userMessage, confidenceResult) {
    return `I apologize, but I don't have verified information about "${userMessage}" in my knowledge base.

${confidenceResult.reasoning}

For accurate information, I recommend:
- Checking <a href="https://www.fz-juelich.de" target="_blank">Forschungszentrum Jülich's website</a>
- <a href="mailto:a@xrzhou.com">Contacting Xiaoran directly</a>
- Exploring the publications section on this website`;
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
   * Multi-stage API call with RAG and confidence check
   */
  async callAPI(userMessage, agent = null, onChunk = null) {
    const selectedAgent = agent || this.currentAgent || this.selectAgent(userMessage);

    try {
      // === STAGE 1: Query Knowledge Base ===
      const kbResults = this.queryKnowledgeBase(userMessage);
      let systemPrompt = selectedAgent.system_prompt;
      let confidenceSource = 'unknown';

      if (kbResults && kbResults.length > 0) {
        // Found in KB - use verified facts
        systemPrompt += this.formatContextFromResults(kbResults);
        confidenceSource = 'knowledge_base';
        if (this.debug) {
          console.log('Using KB data, confidence: HIGH');
        }
      } else {
        // === STAGE 2: Confidence Check ===
        confidenceSource = 'model_evaluated';
        const confidenceCheck = await this.checkResponseConfidence(userMessage, selectedAgent);

        if (confidenceCheck.confidence < 0.5) {
          // Low confidence - return fallback
          if (this.debug) {
            console.log('Low confidence, using fallback');
          }
          return {
            response: this.getUncertainResponse(userMessage, confidenceCheck),
            agent: selectedAgent,
            confidenceScore: confidenceCheck.confidence * 100,
            confidenceSource: 'fallback'
          };
        }

        // Medium confidence - add uncertainty instruction
        if (confidenceCheck.confidence < 0.7) {
          systemPrompt += '\n\nIMPORTANT: You have limited confidence in this topic. Use qualifying language like "to my knowledge", "I believe", or "may include". Admit uncertainty when appropriate.\n';
        }

        if (this.debug) {
          console.log('Model confidence:', confidenceCheck.confidence, confidenceCheck.reasoning);
        }
      }

      // Build messages with context-enhanced system prompt
      const recentHistory = this.conversationHistory.slice(-20);
      const messages = [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: userMessage }
      ];

      const requestBody = {
        model: this.model,
        messages: messages,
        max_tokens: Math.min(selectedAgent.max_tokens || 2000, 2000),
        temperature: selectedAgent.temperature || 0.7,
        stream: onChunk ? true : false
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

      // Add user message and bot response to conversation history
      this.conversationHistory.push(
        {
          role: "user",
          content: userMessage
        },
        {
          role: "assistant",
          content: botResponse
        }
      );

      if (this.debug) {
        console.log('API Response:', botResponse);
      }

      // Calculate confidence score
      const confidenceScore = confidenceSource === 'knowledge_base' ? 95 :
                              confidenceSource === 'model_evaluated' ? 70 : 30;

      return {
        response: botResponse,
        agent: selectedAgent,
        usage: data.usage,
        confidenceScore: confidenceScore,
        confidenceSource: confidenceSource
      };

    } catch (error) {
      console.error('API Error:', error);

      // FALLBACK: Always return something useful
      return {
        response: this.getFallbackResponse(userMessage),
        agent: selectedAgent,
        confidenceScore: 20,
        confidenceSource: 'fallback_error',
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

      // Add user message and bot response to conversation history
      this.conversationHistory.push(
        {
          role: "user",
          content: userMessage
        },
        {
          role: "assistant",
          content: fullResponse
        }
      );

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
