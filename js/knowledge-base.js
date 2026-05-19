/**
 * Knowledge Base for RAG (Retrieval-Augmented Generation)
 * Contains verified facts about institutions, projects, and publications
 */
const KNOWLEDGE_BASE = {
  institutions: [
    {
      id: "ibg-3",
      name: "IBG-3: Agrosphere",
      aliases: ["ibg3", "ibg 3", "ibg-3", "agrosphere"],
      description: "Institute of Bio- and Geosciences - Agrosphere",
      focus: "Sustainable use of soil, water, atmosphere resources",
      research_areas: [
        "Soil-plant-atmosphere exchange processes",
        "Water and nutrient fluxes in agroecosystems",
        "Climate change and land use impacts",
        "Catchment hydrology and ecohydrology"
      ],
      url: "https://www.fz-juelich.de/en/institutes/ibg/agrosphere-ibg-3"
    },
    {
      id: "ibg-4",
      name: "IBG-4: Bioinformatics",
      aliases: ["ibg4", "ibg 4", "ibg-4", "bioinformatics"],
      description: "Institute of Bio- and Geosciences - Bioinformatics",
      focus: "Development of methods and algorithms for bioinformatics",
      research_areas: [
        "Knowledge management and data integration",
        "Sequence and structure-based approaches",
        "Machine learning for predictions",
        "Bioinformatics algorithms"
      ],
      url: "https://www.fz-juelich.de/en/ibg/ibg-4"
    }
  ],
  projects: [
    {
      id: "dataplan",
      name: "DataPLAN",
      aliases: ["dataplan", "dmp", "data management plan", "data plan"],
      description: "LLM-powered data management plan generator for plant sciences",
      publication: "Data 2023, DOI: 10.3390/data8110159",
      url: "https://plan.nfdi4plants.org"
    },
    {
      id: "elab2arc",
      name: "elab2arc",
      aliases: ["elab2arc", "lab2arc", "protocol conversion", "arc", "elabftw"],
      description: "Web-based Single Page Application (SPA) that bridges eLabFTW (electronic lab notebook) and PLANTdataHUB (GitLab-based ARC repository), enabling seamless synchronization of experimental metadata and raw data into FAIR-compliant ARCs",
      url: "https://github.com/nfdi4plants/elab2arc"
    }
  ],
  publications: [
    {
      id: "zhou2022",
      title: "CPlantBox: a whole-plant modelling framework",
      journal: "in silico Plants",
      year: "2022",
      aliases: ["cplantbox", "plant modeling", "whole-plant modelling"]
    },
    {
      id: "phd-thesis",
      title: "PhD Thesis: Modeling Coupled Carbon and Water Flow in Growing Plants",
      description: "Focuses on modeling the coupled flow of carbon and water in growing plants, with particular attention to the feedback between conduit resistance and axial growth rate. Presents a mechanistic functional–structural plant model (FSPM) that integrates water transport, carbon allocation, and dynamic plant growth.",
      year: "2024",
      aliases: ["phd", "thesis", "dissertation", "fsp", "functional-structural plant model", "plant growth", "carbon flow", "water flow", "phloem"]
    }
  ]
};
