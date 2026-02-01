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
      aliases: ["elab2arc", "protocol conversion", "arc"],
      description: "Converts free-text protocols to ARC-compliant Excel files",
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
    }
  ]
};
