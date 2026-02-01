/**
 * Node.js test for RAG system
 * Run: node test-rag-node.js
 */

const KNOWLEDGE_BASE = {
  institutions: [
    {
      id: "ibg-3",
      name: "IBG-3: Agrosphere",
      aliases: ["ibg3", "ibg 3", "ibg-3", "agrosphere"],
      description: "Institute of Bio- and Geosciences - Agrosphere",
      focus: "Sustainable use of soil, water, atmosphere resources"
    },
    {
      id: "ibg-4",
      name: "IBG-4: Bioinformatics",
      aliases: ["ibg4", "ibg 4", "ibg-4", "bioinformatics"],
      description: "Institute of Bio- and Geosciences - Bioinformatics",
      focus: "Development of methods and algorithms for bioinformatics"
    }
  ],
  projects: [
    {
      id: "dataplan",
      name: "DataPLAN",
      aliases: ["dataplan", "dmp", "data management plan", "data plan"],
      description: "LLM-powered data management plan generator for plant sciences",
      publication: "Data 2023, DOI: 10.3390/data8110159"
    },
    {
      id: "elab2arc",
      name: "elab2arc",
      aliases: ["elab2arc", "protocol conversion", "arc"],
      description: "Converts free-text protocols to ARC-compliant Excel files"
    }
  ],
  publications: [
    {
      id: "zhou2022",
      title: "CPlantBox: a whole-plant modelling framework",
      journal: "in silico Plants",
      year: "2022",
      aliases: ["cplantbox", "plant modeling", "whole-plant modelling"]
    }
  ]
};

function queryKnowledgeBaseSimple(userMessage, kb) {
  const messageLower = userMessage.toLowerCase();
  const results = [];

  for (const item of kb.institutions || []) {
    for (const alias of item.aliases || []) {
      if (messageLower.includes(alias.toLowerCase())) {
        results.push(item);
        break;
      }
    }
  }

  for (const item of kb.projects || []) {
    for (const alias of item.aliases || []) {
      if (messageLower.includes(alias.toLowerCase())) {
        results.push(item);
        break;
      }
    }
  }

  for (const item of kb.publications || []) {
    for (const alias of item.aliases || []) {
      if (messageLower.includes(alias.toLowerCase())) {
        results.push(item);
        break;
      }
    }
  }

  return results.length > 0 ? results : null;
}

const testCases = [
  { query: "What is IBG-4?", expected: "ibg-4", description: "Should find IBG-4 Bioinformatics" },
  { query: "Tell me about IBG-3", expected: "ibg-3", description: "Should find IBG-3 Agrosphere" },
  { query: "What is DataPLAN?", expected: "dataplan", description: "Should find DataPLAN project" },
  { query: "Tell me about elab2arc", expected: "elab2arc", description: "Should find elab2arc project" },
  { query: "What is CPlantBox?", expected: "zhou2022", description: "Should find CPlantBox publication" },
  { query: "Tell me about bioinformatics", expected: "ibg-4", description: "Should match bioinformatics alias" },
  { query: "What is Xiaoran's favorite color?", expected: null, description: "Should return no results" }
];

console.log('🧪 RAG System Test (Node.js)\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const results = queryKnowledgeBaseSimple(test.query, KNOWLEDGE_BASE);
  const hasExpected = results && results.some(r => r.id === test.expected);
  const success = test.expected === null ? !results : hasExpected;

  const status = success ? '✅ PASS' : '❌ FAIL';
  const got = results ? results.map(r => r.id).join(', ') : 'none';

  console.log(`Test ${index + 1}: ${test.query}`);
  console.log(`  ${test.description}`);
  console.log(`  ${status} | Expected: ${test.expected || 'none'} | Got: ${got}`);

  if (results && results.length > 0) {
    results.forEach(r => {
      console.log(`    - ${r.name || r.title}: ${r.description}`);
    });
  }

  console.log('');

  if (success) passed++; else failed++;
});

console.log(`📊 Summary: ${passed}/${testCases.length} tests passed`);

if (failed === 0) {
  console.log('\n✅ All tests passed! The RAG system is working correctly.');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed.`);
  process.exit(1);
}
