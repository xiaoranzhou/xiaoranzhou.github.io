# Xiaoran Zhou — Personal Site & Portfolio

Live at **[xrzhou.com](https://xrzhou.com)** &middot; Source: [github.com/xiaoranzhou/xiaoranzhou.github.io](https://github.com/xiaoranzhou/xiaoranzhou.github.io)

AI-driven Plant Data Infrastructure Scientist at Forschungszentrum Jülich. Building LLM-powered tools for research data management.

---

## Site Structure

| Page | Path | Description |
|------|------|-------------|
| Homepage | `/` | Profile, AI tools overview, skills, publications, AI chatbot |
| Blog | `/blog.html` | Writing index |
| Post: LLM Superhero Matrix | `/blog-superhero-matrix.html` | 9 LLMs rank each other as superheroes |
| Post: I Missed the AI Revolution | `/blog-ai-revolution.html` | Essay on AI adoption and FOMO |
| AI Portfolio | `/portfolio.html` | Extended project showcase |
| WASM Tools | `/wasm/` | In-browser ARC/SWATE converters (Pyodide) |
| 3D Visualizations | `/zhou2022_3D.html` | CPlantBox root node figures (Plotly + D3) |

---

## Tools & Projects

- **DataPLAN** — LLM-powered data management plan generator for plant sciences
  [plan.nfdi4plants.org](https://plan.nfdi4plants.org) · [GitHub](https://github.com/nfdi4plants/dataplan)
- **DMP-EVA** — AI-assisted DMP evaluation tool
  [GitHub](https://github.com/usadellab/dmp-eva)
- **elab2arc** — eLabFTW to ARC format converter
  [GitHub](https://github.com/nfdi4plants/elab2arc)

---

## Blog Posts

1. [I Asked 9 LLMs to Rank Each Other as Superheroes](blog-superhero-matrix.html) — LLM personality experiment, April 2026
2. [I Missed the AI Revolution. And That's OK.](blog-ai-revolution.html) — Reflection on Vernor Vinge and AI FOMO, April 2026

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Layout | HTML5, Bootstrap 5.2, custom CSS |
| Visualizations | Plotly.js (CDN), Three.js, D3.js |
| In-browser computation | Pyodide (WebAssembly Python) |
| AI chatbot | Digital twin assistant (knowledge-base.js, chat-state.js, agent-prompts.json) |
| Hosting | GitHub Pages with custom domain (xrzhou.com) |

---

## Local Development

No build step required. Open any `.html` file directly in a browser for most pages.

The WASM tools (`/wasm/`) require a local HTTP server — Pyodide cannot load from `file://`:

```bash
python -m http.server 8080
# then open http://localhost:8080/wasm/
```

---

## License

[GPL-3.0](LICENSE)
