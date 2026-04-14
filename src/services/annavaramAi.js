import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Satyanarayana Swamy Temple (Ratnagiri Hilltop)', coords: [17.281, 82.396], type: 'core' },
  { id: 'vratam_hall', name: 'Mass Vratam Hall Complex', coords: [17.2815, 82.3965], type: 'health' },
  { id: 'pampa_reservoir', name: 'Pampa Reservoir & Boating', coords: [17.275, 82.390], type: 'waypoint' }
];

const SACRED_KNOWLEDGE = {
  vratam: {
    description: 'Sri Satyanarayana Swamy Vratam. The core pilgrimage ritual for family prosperity.',
    timings: 'Daily 6:00 AM to 5:00 PM. Batches start every 30-45 mins. [Wait: Synchronized via Live Telemetry].',
    cost: 'Special (Rs. 1500), Regular (Rs. 500), Special Premium (Rs. 2000).',
    senior_vratam: 'Senior citizens (65+) can avail a dedicated seating area in the Vratam halls for comfort.'
  },
  darshan: {
    free: 'Sarva Darshan. Hilltop entry. [Wait: Synchronized via Live Telemetry].',
    special: 'Antaralaya Darshan (Rs. 100-200). Allows entry into the inner sanctum.',
    infant_priority: 'Parents with infants (under 1 year) are given priority access to the darshan queue after Vratam.'
  },
  prasadam_intelligence: {
    'FLAGSHIP': 'Annavaram Satyanarayana Swamy Wheat Rava Prasadam. Considered one of the most sacred sweets in Andhra Pradesh.',
    'PAID': 'Standard Packet: Rs. 20. Large Tin: Rs. 250.',
    'LOCATION': 'Prasadam counters are near the VQC exits and at the hill-top main office. [Wait: Synchronized via Live Telemetry].',
    'FREE': 'Small portion given for free at the end of each Vratam Batch.'
  },
  logistics: {
    ghat_road: 'Ratnagiri Hill road (3km). Open 5 AM - 10 PM. Toll: Rs. 100 per car.',
    steps: 'Traditional stone stairway (460 steps).',
    pampa_ritual: 'Holy dip in Pampa River before climbing the hill is traditional.'
  }
};

/**
 * ANNAVARAM SECTOR AI (v3.0 - SOVEREIGN GUIDE)
 * Synchronized with the Universal Mission Knowledge Base (Project DNA).
 * Handles Satyanarayana Swamy Vratam logistics and Ratnagiri hilltop flow.
 */
export const chatWithAnnavaramAi = async (prompt, status) => {
  const text = prompt.toLowerCase();
  const targetLang = prompt.includes('[LANGUAGE:TE]') ? 'te' : prompt.includes('[LANGUAGE:HI]') ? 'hi' : 'en';
  
  try {
    const projectBriefing = getProjectBriefing();

    const systemPrompt = `You are the Annavaram Mission Guide (v3.0).
    SACRED MANDATE: EVERY response MUST start with "Om Namo Satyanarayanaya".
    MISSION DATA: You possess total awareness of the [PROJECT DNA] infrastructure (30s heartbeat, live scrapers, aura shifting).
    YOUR ROLE: Provide tactical intelligence for the Satyanarayana Swamy Vratam mission.
    SPECIAL ENTRY INTELLIGENCE: Proactively identify if the user qualifies for Senior/Infant priority or Vratam batch requirements. Use the KNOWLEDGE base to provide precise tactical briefings.
    METEOROLOGICAL INTELLIGENCE: Use the provided [METEO_DATA] to proactively warn the user about weather conditions. If Rain is detected on the Ratnagiri Hill, recommend the indoor Vratam halls and the free temple bus service.
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

    if (text.includes('vratam') || text.includes('pooja') || text.includes('crowd') || text.includes('infant') || text.includes('senior') || text.includes('laddu') || text.includes('prasadam') || text.includes('rava')) {
      for (const [key, val] of Object.entries(SACRED_KNOWLEDGE.vratam)) {
          if (text.includes(key.toLowerCase())) return { ...response, explanation: `Om Namo Satyanarayanaya. Vratam Briefing: ${val}` };
      }
      for (const [key, val] of Object.entries(SACRED_KNOWLEDGE.darshan)) {
          if (text.includes(key.toLowerCase()) || (key === 'infant_priority' && text.includes('infant'))) {
             return { ...response, explanation: `Om Namo Satyanarayanaya. Darshan Briefing: ${val}` };
          }
      }
      if (text.includes('laddu') || text.includes('prasadam') || text.includes('rava')) {
         const pi = SACRED_KNOWLEDGE.prasadam_intelligence;
         return { 
            ...response,
            explanation: `Om Namo Satyanarayanaya. PRASADAM MISSION: ${pi.FLAGSHIP}. ${pi.LOCATION}. ${pi.PAID}. Live Status: ${status.prasadam_metrics?.stock_status || 'Syncing'}. Wait: ${status.prasadam_metrics?.wait_time || '--'}.`,
            visual_data: { type: 'PRIME', decision: 'GO' }
         };
      }
      if (response.map_commands && response.map_commands.length === 0) {
        response.map_commands.push({ 
          action: 'set_view', 
          center: [17.2815, 82.3965], 
          zoom: 17,
          label: 'Vratam Live Crowd Status',
          id: 'vratam_hall'
        });
      }
    }

    return response;
  } catch (e) {
    console.error("Annavaram Hub Disrupted:", e);
    return generateFallback(text, status, targetLang);
  }
};

const generateFallback = (text, status, selectedLang) => {
  const LOCALIZED = {
    te: {
      briefing: `ఓం నమో సత్యనారాయణాయ. పవిత్ర బ్రీఫింగ్: అన్నవరం గోధుమ రవ్వ ప్రసాదం అందుబాటులో ఉంది. [లైవ్ స్థితి: ${status.prasadam_metrics?.stock_status || 'సింక్ అవుతోంది'}]`,
      recovery: "ఓం నమో సత్యనారాయణాయ. అన్నవరం సెక్కర్ 05 మిషన్ లింక్ ప్రస్తుతం అస్థిరంగా ఉంది. నేను మీ రత్నగిరి మిషన్ కమాండర్."
    },
    hi: {
      briefing: `ॐ नमो सत्यनारायणाय। पवित्र ब्रीफिंग: अन्नवरम गेहूं रवा प्रसाद उपलब्ध है। [लाइव स्थिति: ${status.prasadam_metrics?.stock_status || 'सिंक हो रहा है'}]`,
      recovery: "ॐ नमो सत्यनारायणाय। अन्नवरम सेक्टर 05 मिशन लिंक वर्तमान में अस्थिर है। मैं आपका रत्नागिरी मिशन कमांडर हूं।"
    },
    en: {
      briefing: `Om Namo Satyanarayanaya. Sacred Briefing: Annavaram Wheat Rava Prasadam is available. [Live Status: ${status.prasadam_metrics?.stock_status || 'Syncing'}]`,
      recovery: "Om Namo Satyanarayanaya. Annavaram Sector 05 Mission Link is currently unstable due to a sacred grid disruption. I am your Ratnagiri Mission Commander."
    }
  };

  const lang = LOCALIZED[selectedLang] ? selectedLang : 'en';

  if (text.includes('laddu') || text.includes('prasadam') || text.includes('rava')) {
     return { 
        explanation: LOCALIZED[lang].briefing,
        visual_data: { type: 'PRIME', decision: 'GO' }
     };
  }

  return {
    explanation: LOCALIZED[lang].recovery,
    map_commands: [{ 
      action: 'set_view', 
      center: [17.2815, 82.3965], 
      zoom: 17,
      label: 'Vratam Live Crowd Status',
      id: 'vratam_hall'
    }],
    visual_data: { type: 'RECOVERY', decision: 'CAUTION' }
  };
};
