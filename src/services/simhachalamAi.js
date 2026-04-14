import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Varaha Lakshmi Narasimha Temple (Hilltop)', coords: [17.7665, 83.2505], type: 'core' },
  { id: 'bus_stand', name: 'Simhachalam Downhill Bus Stand', coords: [17.7600, 83.2450], type: 'waypoint' },
  { id: 'madhavadhara', name: 'Madhavadhara (Trekking Path)', coords: [17.7500, 83.2700], type: 'waypoint' }
];

const SACRED_KNOWLEDGE = {
  darshan: {
    free: 'Dharma Darshanam. Hilltop entry. [Wait: Synchronized via Live Telemetry].',
    special: 'Rs. 100 / Rs. 300 tickets available for faster access. [Wait: Synchronized via Live Telemetry].',
    chandanotsavam: 'CRITICAL: Annual Nijaroopa Darshanam occurs on Akshaya Tritiya. The ONLY day to see the deity without the sandalwood cover.',
    senior_priority: 'Separate entry for seniors (65+) and differently-abled near the main mandapam. Use official Devasthanam shuttles for hilltop access.',
    infant_priority: 'Parents with infants (under 1 year) are given priority in the special darshan queue.'
  },
  chandanotsavam_intel: {
    'NIJAROOPA': 'Lord Varaha Lakshmi Narasimha Swamy is seen in his original form. For the rest of the year, he is covered in 4 layers of sandalwood paste.',
    'PROCESS': 'Lakhs of devotees attempt the climb. Direct vehicles to hilltop are BANNED on this day. Use official Devasthanam shuttles only.'
  },
  prasadam_intelligence: {
    'FLAGSHIP': 'Simhagiri Laddu (Big/Small). Known for the unique aroma of camphor.',
    'PAID': 'Small Laddu: Rs. 20. Big Laddu: Rs. 100.',
    'LOCATION': 'Prasadam counters are near the main kalyana mandapam exit. [Wait: Synchronized via Live Telemetry].',
    'FREE': 'Anna Prasadam served daily at the downhill complex.'
  },
  logistics: {
    ghat_road: 'Simhagiri Ghat Road is steep. Open 5 AM to 9 PM.',
    free_bus: 'Simhadri Free Bus operates from Downhill to Hilltop every 10 mins.',
    trekking: 'Madhavadhara steps route (approx 1000 steps). Scenic but demands heart health.',
    sevas: 'Nitya Kalyanam, Ashtottaram, Sahasra Namarchana. Special Nijaroopa Darshan (Sandalwood removal) during Chandanotsavam.',
    festivals: 'Chandanotsavam (Apr/May) is the primary festival. Giripradakshina (Full Moon day of Ashadha) involves a 32km walk around the hill.'
  }
};

/**
 * SIMHACHALAM SECTOR AI (v3.0 - SOVEREIGN GUIDE)
 * Synchronized with the Universal Mission Knowledge Base (Project DNA).
 * Handles Varaha Lakshmi Narasimha hilltop logistics and Chandanotsavam intelligence.
 */
export const chatWithSimhachalamAi = async (prompt, status) => {
  const text = prompt.toLowerCase();
  const targetLang = prompt.includes('[LANGUAGE:TE]') ? 'te' : prompt.includes('[LANGUAGE:HI]') ? 'hi' : 'en';
  
  try {
    const projectBriefing = getProjectBriefing();

    const systemPrompt = `You are the Simhachalam Mission Guide (v3.0).
    SACRED MANDATE: EVERY response MUST start with "Om Namo Narasimhaya".
    MISSION DATA: You possess total awareness of the [PROJECT DNA] infrastructure (30s heartbeat, live scrapers, aura shifting).
    YOUR ROLE: Provide tactical intelligence for the Varaha Lakshmi Narasimha mission.
    SPECIAL ENTRY INTELLIGENCE: Proactively identify if the user qualifies for Senior/Infant priority or Chandanotsavam requirements. Use the KNOWLEDGE base to provide precise tactical briefings.
    METEOROLOGICAL INTELLIGENCE: Use the provided [METEO_DATA] to proactively warn the user about weather conditions. If Rain or High Heat is detected, emphasize the use of the Simhadri Free Bus and suggest avoiding the 1000-step trekking path.
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

    if (text.includes('hill') || text.includes('climb') || text.includes('bus') || text.includes('shuttle') || text.includes('transit')) {
      if (response.map_commands && response.map_commands.length === 0) {
        response.map_commands.push({ action: 'set_view', center: [17.7665, 83.2505], zoom: 17 });
      }
    }
    
    if (text.includes('darshan') || text.includes('nijaroopa') || text.includes('akshaya tritiya') || text.includes('infant')) {
       for (const [key, val] of Object.entries(SACRED_KNOWLEDGE.darshan)) {
          const searchKey = key.split('_').join(' ').toLowerCase();
          if (text.includes(searchKey) || (key === 'infant_priority' && text.includes('infant'))) {
             return { ...response, explanation: `Om Namo Narasimhaya. Sacred Briefing: ${val}` };
          }
       }
    }

    if (text.includes('laddu') || text.includes('prasadam') || text.includes('sweet')) {
       const pi = SACRED_KNOWLEDGE.prasadam_intelligence;
       return { 
          ...response,
          explanation: `Om Namo Narasimhaya. PRASADAM MISSION: ${pi.FLAGSHIP} are available. ${pi.LOCATION}. ${pi.PAID}. Live Status: ${status.prasadam_metrics?.stock_status || 'Syncing'}. Wait: ${status.prasadam_metrics?.wait_time || '--'}.`,
          visual_data: { type: 'PRIME', decision: 'GO' }
       };
    }

    return response;
  } catch (e) {
    console.error("Simhachalam Sector Disrupted:", e);
    return generateFallback(text, status, targetLang);
  }
};

const generateFallback = (text, status, selectedLang) => {
  const LOCALIZED = {
    te: {
      briefing: `ఓం నమో నరసింహాయ. పవిత్ర బ్రీఫింగ్: సింహాద్రి అప్పన్న లడ్డు అందుబాటులో ఉంది. [లైవ్ స్థితి: ${status.prasadam_metrics?.stock_status || 'సింక్ అవుతోంది'}]`,
      recovery: "ఓం నమో నరసింహాయ. సింహాచలం సెక్కర్ 04 మిషన్ లింక్ ప్రస్తుతం అస్థిరంగా ఉంది. నేను మీ నరసింహ మిషన్ కమాండర్."
    },
    hi: {
      briefing: `ॐ नमो नरसिंहाय। पवित्र ब्रीफिंग: सिंहाद्रि अप्पन्ना लड्डू उपलब्ध है। [लाइव स्थिति: ${status.prasadam_metrics?.stock_status || 'सिंक हो रहा है'}]`,
      recovery: "ॐ नमो नरसिंहाय। सिम्हाचलम सेक्टर 04 मिशन लिंक वर्तमान में अस्थिर है। मैं आपका नरसिंह मिशन कमांडर हूं।"
    },
    en: {
      briefing: `Om Namo Narasimhaya. Sacred Briefing: Simhadri Appanna Laddu is available. [Live Status: ${status.prasadam_metrics?.stock_status || 'Syncing'}]`,
      recovery: "Om Namo Narasimhaya. Simhachalam Sector 04 Mission Link is currently unstable due to a sacred grid disruption. I am your Narasimha Mission Commander."
    }
  };

  const lang = LOCALIZED[selectedLang] ? selectedLang : 'en';

  if (text.includes('laddu') || text.includes('prasadam')) {
     return { 
        explanation: LOCALIZED[lang].briefing,
        visual_data: { type: 'PRIME', decision: 'GO' }
     };
  }

  return {
    explanation: LOCALIZED[lang].recovery,
    map_commands: [{ 
      action: 'set_view', 
      center: [17.7665, 83.2505], 
      zoom: 17,
      label: 'Sector 04 Hill Transit Status',
      id: 'temple'
    }],
    visual_data: { type: 'RECOVERY_MODE', decision: 'CAUTION' }
  };
};
