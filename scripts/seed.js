/**
 * Run after `npm run develop` in cms/ to seed the first article.
 * Usage: STRAPI_TOKEN=<your-api-token> node cms/scripts/seed.js
 */

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const TOKEN = process.env.STRAPI_TOKEN;

if (!TOKEN) {
  console.error("Set STRAPI_TOKEN to a full-access API token from the Strapi admin.");
  process.exit(1);
}

const article = {
  slug: "martindale-identifies-chemosynthetic-microbial-mats-jurassic-deep-sea-morocco",
  originalHeadline: "Scientists stunned by signs of ancient life in a place no one expected",
  correctedHeadline:
    "Martindale et al. identify chemosynthetic microbial mats in 180-million-year-old deep-sea sediments, Morocco",
  tldr: "A team led by Dr. Rowan Martindale (UT Austin) found wrinkle structures — normally a signature of sunlit, shallow-water microbial mats — preserved in Jurassic-era deep-sea rocks from Morocco's Dadès Valley. Carbon-enrichment analysis suggests the organisms were chemosynthetic bacteria, not photosynthetic ones. The find expands the known habitat range of ancient microbial ecosystems and challenges the assumption that wrinkle structures can only form near the ocean surface.",
  failureModes: ["Clickbait", "Framing Bias"],
  publication: "ScienceDaily",
  sourceUrl: "https://www.sciencedaily.com/releases/2026/06/260621111234.htm",
  originalPublishDate: "2026-06-26",
  author: "Terasu",
  summary: [
    "Researchers working in Morocco's Dadès Valley discovered wrinkle structures preserved in turbidite rocks approximately 180 million years old — sediments that formed on the deep seafloor, at minimum depths of 180 metres (590 feet) below the ancient ocean surface, well beyond the reach of sunlight.",
    "Wrinkle structures are textured, ripple-like features in sedimentary rock. They are well-documented as a product of microbial mat activity — colonies of microbes that bind and stabilise sediment. Historically, these structures have been found almost exclusively in shallow, sunlit marine environments, which is why their presence in deep-water turbidites was unexpected.",
    "The team, led by Dr. Rowan Martindale of The University of Texas at Austin and Stéphane Bodin of Aarhus University, confirmed through geological analysis that the sediments formed in deep water, not a shallow environment later altered by burial or erosion. They also detected elevated carbon concentrations directly beneath the wrinkled surfaces — a chemical signature consistent with biological activity.",
    "Their proposed explanation: chemosynthetic bacteria. Unlike photosynthetic organisms, chemosynthetic microbes generate energy from chemical reactions — such as oxidising hydrogen sulfide — rather than from sunlight. This would allow them to thrive on the dark deep seafloor. The study suggests that deep-ocean microbial ecosystems were more widespread during the Jurassic than previously understood, and that many rock formations previously considered unlikely to preserve ancient life may be worth re-examining.",
    "The findings were published in the journal Geology (Volume 54, DOI: 10.1130/G53617.1). Co-authors include Sinjini Sinha, Travis N. Stone, Tanner Fonville, François-Nicolas Krencker, Peter Girguis, Crispin T.S. Little, and Lahcen Kabiri."
  ],
  critique: [
    "The original headline fails on two counts simultaneously, which is why it earns both a Clickbait and a Framing Bias tag.",
    "On clickbait: 'Scientists stunned' is an emotional descriptor applied to a research team about their own published findings. It does not describe the finding. 'A place no one expected' withholds the actual information — that the structures were found in deep-water turbidites, not shallow sediments — in order to manufacture curiosity. The ScienceDaily press release has the specific detail. The headline chose vagueness over it.",
    "PULLQUOTE:\"'A place no one expected' is the whole finding, stated in a way that deliberately refuses to say what it is.\"",
    "On framing bias: The press release names Dr. Rowan Martindale and Stéphane Bodin as the lead researchers. The headline replaces them with the generic placeholder 'scientists.' This is a pattern ScienceDaily uses routinely: institutional or collective credit over named attribution. The practical effect is that a decade of specific scientific work by specific people is absorbed into the anonymous background noise of 'science.' Dr. Martindale is a named, findable researcher at UT Austin. Her name was available and was not used.",
    "The corrected headline does three things: names the lead author, states the specific finding (chemosynthetic microbial mats in deep-sea sediment), and gives geographic context (Morocco). It is longer. That length is the information the original headline chose to discard."
  ],
  section: "science",
  tags: ["Attribution", "Vague Language", "Science Journalism", "Microbiology", "Geology"],
  sources: [
    {
      title: "Original ScienceDaily article (June 26, 2026)",
      url: "https://www.sciencedaily.com/releases/2026/06/260621111234.htm",
      note: "Primary source — press release from the Geological Society of America"
    },
    {
      title: "Martindale et al. (2025). Geology, Vol. 54, p.173. DOI: 10.1130/G53617.1",
      url: "https://doi.org/10.1130/G53617.1",
      note: "Original peer-reviewed paper in Geology"
    },
    {
      title: "Dr. Rowan Martindale — UT Austin Jackson School of Geosciences",
      url: "https://www.jsg.utexas.edu/researcher/rowan_martindale/",
      note: "Lead author's institutional profile"
    },
    {
      title: "Stéphane Bodin — Aarhus University, Department of Geoscience",
      url: "https://pure.au.dk/portal/en/persons/stephane-bodin(b24d2c2a-c234-4a5e-8b43-7cf59e5a19f6).html",
      note: "Co-lead author's institutional profile"
    }
  ],
  publishedAt: new Date().toISOString()
};

async function seed() {
  console.log("Seeding article to Strapi…");

  const res = await fetch(`${STRAPI_URL}/api/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ data: article })
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("Failed:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  // Strapi v5: fields are flat on data, not nested under .attributes
  console.log(`Created article id=${json.data?.id} slug=${json.data?.slug}`);
}

seed().catch(console.error);
