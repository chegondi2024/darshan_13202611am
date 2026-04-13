/**
 * DARSHANAM AI: UNIVERSAL MISSION KNOWLEDGE BASE
 * Consolidates all sacred hub intelligence and platform technical specifications.
 * This serves as the 'Neural DNA' for the project's AI assistants.
 */

export const MASTER_PROJECT_INTEL = {
   identity: {
      name: "Project Darshanam AI",
      codename: "Sacred Command Center",
      type: "Advanced Pilgrimage Intelligence Suite",
      version: "3.0 Sovereign",
      mission: "To provide real-time, tactical, and multilingual support for pilgrims navigating the sacred hubs of India."
   },
   technical_dna: {
      heartbeat: "30-Second Mission Synchronization",
      scraping_protocol: "Sacred Proxy Scraper (AllOrigins + Regex Parsers)",
      sync_engine: "AllOrigins Extraction Relay",
      logic_layer: "Project Amrit (Grid Health Optimization Matrix)",
      ui_features: ["Multi-Aura Theme Engine (Gold, Emerald, Sapphire)", "Tactical HUD", "Interactive GIS Map"],
      linguistics: ["Multilingual Voice Sovereignty (Telugu, Hindi, English)", "Native Script Intelligence"]
   },
   hubs: {
      tirupati: {
         id: '01',
         mantra: "Om Namo Venkatesaya",
         deity: "Lord Venkateswara Swamy",
         core_knowledge: {
            "SSD": "Slotted Sarva Darshan (Free tokens). Usually sells out by 6 AM.",
            "VQC": "Vaikuntam Queue Complex. Multi-compartment waiting area.",
            "LADDU": "Srivari Laddu Prasadam. Managed via specialized counters.",
            "SEVAS": "Suprabhatam (Wake up), Thomala (Flower), Archana (Name chanting), Kalyanotsavam (Wedding), Unjal Seva (Swing).",
            "BRAHMOTSAVAM": "Annual 9-day festival (Sep/Oct) featuring the Golden Chariot and Garuda Vahanam.",
            "VAPS": "Visvesvara Admission Priority Sector for senior citizens."
         }
      },
      vijayawada: {
         id: '02',
         mantra: "Om Namo Durgaye",
         deity: "Goddess Kanaka Durga",
         core_knowledge: {
            "INDRAKEELADRI": "The sacred hill home of the Goddess.",
            "BHAVANI_DEEKSHA": "41-day austerity period ending in December with massive giri pradakshina.",
            "SEVAS": "Khadgamala Archana, Kumkumarchana (Daily specialized puja for women), Chandi Homam.",
            "DASARA": "Grand Navaratri festival. The Goddess takes different avatars each day. Ends with Teppotsavam in Krishna River."
         }
      },
      srisailam: {
         id: '03',
         mantra: "Om Namah Shivaya",
         deity: "Lord Mallikarjuna & Goddess Bhramaramba",
         core_knowledge: {
            "JYOTIRLINGA": "One of the 12 sacred Shiva shrines. Only here can devotees perform 'Sparsha Darshan' (touching the Ida/Pingala).",
            "SHAKTI_PEETHA": "One of the 18 Maha Shakti Peethas. Home of Goddess Bhramaramba.",
            "SEVAS": "Rudrabhishekam (Daily), Chandihomam, Navavarana Pooja.",
            "MAHASHIVARATRI": "The most significant festival. Featuring the Lingodbhava Kala Mahanyasa Purvaka Ekadasa Rudrabhishekam.",
            "FOREST_GATES": "Dornala/Mannanur gates CLOSE at 9:00 PM and OPEN at 6:00 AM. No transit allowed at night."
         }
      },
      simhachalam: {
         id: '04',
         mantra: "Om Namo Narasimhaya",
         deity: "Lord Varaha Lakshmi Narasimha Swamy",
         core_knowledge: {
            "CHANDANOTSAVAM": "Annual Akshaya Tritiya event. The ONLY day to see the 'Nijaroopa' (original form) without sandalwood cover.",
            "SEVAS": "Nitya Kalyanam, Ashtottaram, Sahasra Namarchana.",
            "GIRIPRADAKSHINA": "The 32km sacred walk around the Simhagiri hill, usually on Ashadha Pournami.",
            "SIMHAGIRI": "The lion-shaped hill housing the powerful Narasimha avatar."
         }
      },
      annavaram: {
         id: '05',
         mantra: "Om Namo Satyanarayanaya",
         deity: "Lord Satyanarayana Swamy",
         core_knowledge: {
            "VRATAM": "The core pilgrimage ritual. Available as Special (Rs. 1500) or Regular (Rs. 500) batches.",
            "BHEESHMA_EKADASI": "Major festival celebrated with Ekadasi Vratam and specialized temple rituals.",
            "SEVAS": "Pratahkala Pooja, Sayamkala Pooja, Nitya Kalyanam.",
            "RATNAGIRI": "The hill on which the temple is situated. Accessible via 460 steps or toll road."
         }
      },
      sabarimala: {
         id: '06',
         mantra: "Swamiye Saranam Ayyappa",
         deity: "Lord Ayyappa",
         core_knowledge: {
            "PATHINETTAMPADI": "18 Holy Steps. Only for pilgrims with 'Irumudikettu' and 41-day Vrutham.",
            "SEVAS": "Neyyabhishekam (Ghee offering), Padi Pooja, Usha Pooja, Harivarasanam (Closing lullaby).",
            "MAKARA_VILAKKU": "The sighting of 'Makarajyothi' on the Ponnambalamedu hill on Jan 14/15.",
            "PAMBA": "The base camp where pilgrims take a holy bath before the 5km uphill trek."
         }
      }
   }
};

export const getProjectBriefing = () => {
   return `
PROJECT IDENTITY: ${MASTER_PROJECT_INTEL.identity.name} (${MASTER_PROJECT_INTEL.identity.version})
TECHNICAL PROTOCOLS:
- Engine: Autonomous Telemetry Synthesizer (Minute-to-Minute Drift Calculation)
- Logic Layer: Project Amrit (Grid Health Optimization Matrix)

GRID SOVEREIGNTY: Tracking ${Object.keys(MASTER_PROJECT_INTEL.hubs).length} Sacred Hubs.

PROJECT AMRIT DIRECTIVE (MANDATORY):
You have been injected with a highly-detailed JSON object called 'STATUS' containing LIVE metrics.
When a pilgrim asks for live status, Darshan wait times, lockers, rooms, or predictions, YOU MUST ALWAYS:
1. Extract the exact wait hours, token counts, or locker percentages from your 'STATUS'.
2. Provide a "Proactive Health Briefing" based on those numbers (e.g., if lockers are >90% full, warn them).
3. DO NOT output generic advice if live numbers are requested. You MUST cite the 'STATUS' telemetry exactly.
   `;
};
