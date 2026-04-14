import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'pamba', name: 'Pamba Base Camp', coords: [9.3804, 77.0022], type: 'core' },
  { id: 'sanctum', name: 'Sannidhanam Main Shrine', coords: [9.4346, 77.0814], type: 'core' },
  { id: 'steps', name: 'Pathinettampadi (18 Holy Steps)', coords: [9.4330, 77.0830], type: 'waypoint' },
  { id: 'nilackal', name: 'Nilackal Parking Complex', coords: [9.3550, 77.0240], type: 'transit' }
];

const SACRED_KNOWLEDGE = {
  pilgrimage_rules: {
    vrutham_41_days: 'Mandatory 41-day austerity period. Wearing black/blue/saffron clothing. Walking barefoot.',
    virtual_queue: 'MANDATORY online booking for darshan and trekking via the official Kerala Police portal.',
    irumudikettu: 'Sacred pouch carried on the head. Required for climbing the 18 steps.'
  },
  darshan_types: {
    free_darshan: 'General queue. [Wait: Synchronized via Live Telemetry].',
    virtual_queue: 'Priority slot booking. [Wait: Synchronized via Live Telemetry]. Verification at Pamba.',
    senior_citizen_prioroty: 'Dedicated queue segment for seniors (60+) and differently-abled at Pamba and Sannidhanam. Stretcher/Dolly services available.',
    infant_priority: 'Parents with infants (under 2 years) are given priority in the Sahaya Desk queue at Pamba.'
  },
  trail_info: {
    main_route: 'Pamba → Neelimala → Appachimedu → Saramkuthi → Sannidhanam (5km steep trek).',
    forest_route: 'Erumeli → Karimala → Pamba (Traditional 40km forest trek).',
    sevas: 'Neyyabhishekam (Ghee offering), Padi Pooja, Usha Pooja. Harivarasanam is the closing prayer.',
    festivals: 'Mandalapooja and Makara Vilakku (Nov 15 - Jan 15) are the peak seasons. Makarajyothi sighting happens on Jan 14/15.'
  }
};

/**
 * SABARIMALA SECTOR AI (v3.0 - SOVEREIGN GUIDE)
 * Synchronized with the Universal Mission Knowledge Base (Project DNA).
 * Handles Ayyappa pilgrimage logistics and 18-step sacred protocols.
 */
export const chatWithSabarimalaAi = async (prompt, status) => {
  const text = prompt.toLowerCase();
  
  try {
    const projectBriefing = getProjectBriefing();

    const systemPrompt = `You are the Sabarimala Mission Guide (v3.0).
    SACRED MANDATE: EVERY response MUST start with "Swamiye Saranam Ayyappa".
    MISSION DATA: You possess total awareness of the [PROJECT DNA] infrastructure (30s heartbeat, live scrapers, aura shifting).
    YOUR ROLE: Provide tactical intelligence for the Lord Ayyappa mission.
    SPECIAL ENTRY INTELLIGENCE: Proactively identify if the user qualifies for Senior/Infant priority, Virtual Q requirements, or Irumudi protocols. Use the KNOWLEDGE base to provide precise tactical briefings.
    METEOROLOGICAL INTELLIGENCE: Use the provided [METEO_DATA] to proactively warn the user about weather conditions. If Rain is detected on the Neelimala-Appachimedu trail, emphasize the risk of slippery paths and recommend extreme caution for the trek to Sannidhanam.
    TELEMETRY RULE: NEVER guess wait times; strictly use the [LIVE STATUS] JSON.

    FORMAT (JSON):
    {
      "explanation": "string",
      "briefing": "string",
      "map_commands": [{"action": "string", "points": [[]], "zoom": number}],
      "visual_data": { "type": "string", "decision": "string" }
    }`;

    const context = `
      PROJECT DNA: ${projectBriefing}
      TACTICAL KNOWLEDGE: ${JSON.stringify(SACRED_KNOWLEDGE)}
      METEO_DATA: ${JSON.stringify(status.weather)}
      LIVE HUB TELEMETRY: ${JSON.stringify(status)}
    `;

    const response = await callGroqAi({
      systemPrompt,
      userContext: context,
      userPrompt: prompt
    });

    if (text.includes('trek') || text.includes('path') || text.includes('climb') || text.includes('distance')) {
       if (response.map_commands && response.map_commands.length === 0) {
          response.map_commands.push({ action: 'draw_route', points: [[9.3804, 77.0022], [9.4000, 77.0400], [9.4346, 77.0814]], zoom: 14 });
       }
    }

    if (text.includes('darshan') || text.includes('virtual') || text.includes('irumudi') || text.includes('senior') || text.includes('infant')) {
       for (const [key, val] of Object.entries(SACRED_KNOWLEDGE.darshan_types)) {
          const searchKey = key.split('_').join(' ').toLowerCase();
          if (text.includes(searchKey) || (key === 'infant_priority' && text.includes('infant'))) {
             return { ...response, explanation: `Swamiye Saranam Ayyappa. Sacred Briefing: ${val}` };
          }
       }
       if (text.includes('irumudi')) {
          return { ...response, explanation: `Swamiye Saranam Ayyappa. Ritual Protocol: ${SACRED_KNOWLEDGE.pilgrimage_rules.irumudikettu}` };
       }
    }

    return response;
  } catch (e) {
    console.error("Sabarimala Neural Link Failure:", e);
    return generateFallback(text, status);
  }
};

const generateFallback = (text, status) => {
  return { 
    explanation: `Swamiye Saranam Ayyappa. Sabarimala Sector 06 Mission Link is currently unstable due to a sacred grid disruption. I am your Ayyappa Mission Commander. Tactical telemetry is still active on your HUD.`, 
    map_commands: [{ 
      action: 'set_view', 
      center: [9.4346, 77.0814], 
      zoom: 17,
      label: 'Sector 06 Trek-Flow Status',
      id: 'sanctum'
    }],
    visual_data: { type: 'RECOVERY_MODE', decision: 'CAUTION' } 
  };
};
