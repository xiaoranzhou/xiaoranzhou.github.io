# Xiaoran Zhou — Personal Website & Portfolio

[![Live Site](https://img.shields.io/badge/Live-xrzhou.com-2ea44f?style=flat-square)](https://xrzhou.com)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222?logo=github&style=flat-square)](https://xiaoranzhou.github.io)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg?style=flat-square)](LICENSE)

> AI-driven Plant Data Infrastructure Scientist at Forschungszentrum Jülich. Building LLM-powered tools that make research data management effortless.

---

## About This Site

This repository powers my personal website, a static portfolio and blog hosted on **GitHub Pages** with a custom domain. It showcases my research projects, open-source tools, publications, and experiments at the intersection of AI and plant science data infrastructure.

The site is built entirely with vanilla HTML, CSS, and JavaScript — no build step, no frameworks, just clean, fast static files.

---

## What's Inside

### Pages

| Page | Path | What You'll Find |
|------|------|------------------|
| **Homepage** | [`/`](https://xrzhou.com) | Bio, skills, featured projects, publications, and a floating AI chatbot |
| **Blog** | [`/pages/blog.html`](https://xrzhou.com/pages/blog.html) | Writing index with featured posts |
| **LLM Superhero Matrix** | [`/blog-superhero-matrix.html`](https://xrzhou.com/blog-superhero-matrix.html) | 9 LLMs rank each other as superheroes — a personality experiment |
| **I Missed the AI Revolution** | [`/blog-ai-revolution.html`](https://xrzhou.com/blog-ai-revolution.html) | Essay on AI adoption, Vernor Vinge, and FOMO |
| **Portfolio** | [`/pages/portfolio.html`](https://xrzhou.com/pages/portfolio.html) | Extended project showcase with details |
| **WASM Tools** | [`/wasm/`](https://xrzhou.com/wasm/) | In-browser data converters powered by Pyodide |
| **3D Visualizations** | [`/pages/zhou2022_3D.html`](https://xrzhou.com/pages/zhou2022_3D.html) | Interactive CPlantBox root node figures |

### Featured Projects

- **[DataPLAN](https://plan.nfdi4plants.org)** — LLM-powered data management plan generator for plant sciences  
  *Generates compliant DMPs from project descriptions using structured prompts.*

- **[DMP-EVA](https://github.com/usadellab/dmp-eva)** — AI-assisted DMP evaluation tool  
  *Evaluates data management plans against FAIR criteria with automated scoring.*

- **[elab2arc](https://github.com/nfdi4plants/elab2arc)** — eLabFTW to ARC format converter  
  *Bridges electronic lab notebooks with the ARC (Annotated Research Context) standard.*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Markup & Styling** | HTML5, Bootstrap 5.2, custom CSS |
| **3D & Visualizations** | Three.js, Plotly.js, D3.js |
| **In-Browser Python** | Pyodide (WebAssembly) for `/wasm/` tools |
| **AI Chatbot** | Custom multi-agent RAG system — see `digital-twin-agent.js`, `knowledge-base.js`, `agent-prompts.json` |
| **Hosting** | GitHub Pages + custom domain `xrzhou.com` |

### Chatbot Architecture

The site includes a floating digital-twin assistant with:

- **Knowledge-base RAG** — JSON-structured facts about projects, publications, and institutions
- **Multi-agent routing** — 9 specialized agents (DataPLAN, elab2arc, DMP-EVA, general, etc.) selected by intent matching
- **Streaming SSE** — Real-time token streaming with typing indicators
- **Confidence scoring** — Falls back gracefully when queries are off-topic
- **Zero dependencies** — Pure vanilla JavaScript, no React/Vue/Angular

---

## Repository Layout

```
├── index.html                  # Main homepage (~99 KB, mostly inline CSS)
├── pages/                      # Subpages
│   ├── blog.html               # Blog index
│   ├── blog-superhero-matrix.html
│   ├── blog-ai-revolution.html
│   ├── portfolio.html          # Extended project showcase
│   └── zhou2022_3D*.html       # 3D scientific visualizations
├── wasm/                       # Pyodide-based in-browser tools
│   ├── index.html              # ARC/SWATE converter
│   ├── mapping.html            # Metadata mapping tool
│   └── css/, js/, images/      # Tool assets
├── blog_post/                  # Blog assets (images, prompts, source text)
├── css/                        # Bootstrap + custom stylesheets
├── js/                         # JavaScript libraries + custom chatbot code
│   ├── digital-twin-agent.js   # Chatbot engine
│   ├── knowledge-base.js       # RAG knowledge base
│   ├── chat-state.js           # Lightweight reactive state manager
│   ├── plotly.js               # Plotly visualization library
│   └── bootstrap.bundle.min.js, three.js, OrbitControls.js
├── images/                     # Photos and animations
├── agent-prompts.json          # Agent definitions
├── archive/                    # Archived dev artifacts (ignored by git)
└── .gitignore
```

> **Note:** The `archive/` directory contains temporary files, testing artifacts, debug snapshots, and generated files that have been moved out of the live site but preserved for reference. It is listed in `.gitignore`.

---

## Local Development

No build step is required. Most pages can be opened directly in a browser.

For the WASM tools (`/wasm/`), a local HTTP server is needed because Pyodide cannot load from `file://` URLs:

```bash
# Python 3
python -m http.server 8080

# Then open http://localhost:8080/wasm/
```

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

---

*Built with yarn and LLM prompts.*
