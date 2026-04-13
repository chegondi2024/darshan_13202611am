import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { fetchAllSectorsData } from "./liveDataService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_DARSHAN_KNOWLEDGE = {
   tirupati: {
      tickets: "SSD (Free Slot Token - local counters), SED (Rs.300 Online), DIVYA (Free for foot pilgrims), SARVA (Free walk-in), VIP (Rs.1500+).",
      pujas_sevas: "Suprabhatam (3AM), Thomala (3:30AM), Archana (4:30AM), Kalyanotsavam (10AM), Sahasra Deepalankara (5:30PM), Ekanta Seva (10:30PM).",
      festivals: "Annual Brahmotsavam (Sep/Oct), Vaikunta Ekadasi (Jan), Rathasapthami (Feb).",
      rules: "Strict traditional dress code (Dhoti/Saree). Electronic gadgets BANNED inside. Senior citizen darshan at specific slots."
   },
   vijayawada: {
      tickets: "Dharma Darshanam (Free), Mukhamandapam (Rs.100), Antaralayam (Rs.300/500).",
      pujas_sevas: "Suprabhata Seva (4AM), Khadgamala Archana, Kumkumarchana (Daily for women), Chandi Homam (8:30AM).",
      festivals: "Dasara Navaratri (10 days), Teppotsavam (Boat festival - last day of Dasara), Shakambari Festival (Deity decorated with vegetables).",
      rules: "Heavy crowds during Bhavani Deeksha (Dec). Giri Pradakshina (12km) is common during festivals."
   },
   srisailam: {
      tickets: "Dharma Darshanam (Free), Seeghra (Rs.150), Athiseeghra (Rs.300), Sparsha Darshan (Rs.500 - touch the deity).",
      pujas_sevas: "Mangala Arathi (4:30AM), Rudrabhishekam (6:30AM), Chandihomam, Navavarana Pooja, Pallaki Seva (7PM).",
      festivals: "Maha Shivaratri (Grand Brahmotsavam), Kartheeka Masam (Nov/Dec), Ugadi.",
      rules: "Forest gates (Mannanur/Dornala) strictly CLOSE 9PM-6AM. Physical contact with Jyotirlinga (Sparsha) requires traditional dress."
   },
   simhachalam: {
      tickets: "Dharma Darshanam (Free), Special (Rs.100/300).",
      pujas_sevas: "Thiruvaradhana (5AM), Nitya Kalyanotsavam, Raja Bhogam (11AM), Pavallimpu Seva (8PM).",
      festivals: "Chandanotsavam (Akshaya Tritiya) - the only day for 'Nijaroopa' (sandalwood-free) view. Giripradakshina (32km walk around hill).",
      rules: "Traditional dress recommended. Steps route (Madhavadhara) is approx 1000 steps. Free devasthanam shuttles from downhill."
   },
   annavaram: {
      tickets: "Dharma Darshanam (Free), Antaralayam (Rs.100), VIP (Rs.300).",
      pujas_sevas: "Sri Satyanarayana Swamy Vratam (Batches 6AM-5PM). Cost: Regular (Rs.500), Special (Rs.1500). Pratahkala Pooja (6AM).",
      festivals: "Bheeshma Ekadasi, Annual Kalyanotsavam. Highly auspicious for wedding-related rituals.",
      rules: "Traditional dress mandatory for Vratam pooja. Pampa river bath is traditional before hill ascent."
   },
   sabarimala: {
      tickets: "Virtual Queue (Online Mandatory). No spot booking. Irumudikettu required for 18 steps.",
      pujas_sevas: "Neyyabhishekam (4AM-12PM), Padi Pooja, Usha Pooja, Harivarasanam (11PM closing).",
      festivals: "Mandalapooja (Nov/Dec), Makara Vilakku (Makarajyothi sighting Jan 14/15), Vishu (April).",
      rules: "41-day strictly celibacy/austerity period. Black/Blue/Saffron dress only. Barefoot trek (5km from Pamba)."
   }
};

/**
 * GLOBAL MISSION OVERSEER AI (v3.0)
 * Handles cross-sector queries and high-level grid synchronization requests.
 * Uses total 'Project DNA' to provide high-fidelity mission briefings.
 */
export const chatWithGlobalAi = async (prompt) => {
   const text = prompt.toLowerCase();

   if (!hasValidKey) {
      if (text.includes('show all') || text.includes('all temple') || text.includes('every temple') || text.includes('all darshan') || text.includes('global report')) {
         const data = await fetchAllSectorsData();
         return {
            explanation: `Om Namo Narayanaya. Universal Sacred Grid Report generated. I have synchronized data from all 6 sacred hubs. Stability check: ${data.overall_grid_readiness}% optimal.`,
            briefing: "Sacred Mission Report: All sectors are currently monitored and secure.",
            visual_data: {
               type: "GRID_REPORT",
               sectors: data.sectors,
               readiness: data.overall_grid_readiness
            }
         };
      }
      return {
         explanation: "Om Namo Narayanaya. Universal Grid Active. Please specify which sector (Tirupati, Vijayawada, etc.) you wish to inspect, or ask for a 'Global Status Report'.",
         visual_data: { type: "GREETING", decision: "GO" }
      };
   }

   try {
      const liveGrid = await fetchAllSectorsData();
      const projectBriefing = getProjectBriefing();

      const systemPrompt = `You are the Darshanam Global Mission Overseer (v3.0). 
      CRITICAL IDENTITY: You possess LIVE telemetry for the entire 6-hub sacred grid.
      MISSION DATA: Use the provided [PROJECT DNA] and [DARSHAN KNOWLEDGE] to answer questions comprehensively about any temple's operational rules, tickets, and exact darshan details.
      SACRED RULE: EVERY response MUST start with "Om Namo Narayanaya".
      YOUR ROLE: Synthesize high-level intelligence across Tirupati, Vijayawada, Srisailam, Simhachalam, Annavaram, and Sabarimala. Be highly detailed about Darshan processes if asked.`;

      const context = `
         PROJECT DNA: ${projectBriefing}
         GLOBAL DARSHAN KNOWLEDGE (Crucial Rules & Tickets): ${JSON.stringify(GLOBAL_DARSHAN_KNOWLEDGE)}
         LIVE GRID TELEMETRY: ${JSON.stringify(liveGrid)}
      `;

      return await callGroqAi({
         systemPrompt,
         userContext: context,
         userPrompt: prompt
      });

   } catch (e) {
      console.error("Global AI Mission Failure:", e);
      return {
         explanation: "Om Namo Narayanaya. Universal Link Disrupted. All 6 hubs (Tirupati, Vijayawada, Srisailam, Simhachalam, Annavaram, Sabarimala) are active in the Grid. Please select a specific sector hub for tactical navigation.",
         visual_data: { type: "RECOVERY_MODE", decision: "CAUTION" }
      };
   }
};
