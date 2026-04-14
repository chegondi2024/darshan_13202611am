import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Mallikarjuna Temple (Jyotirlinga)', coords: [16.0740, 78.8680], type: 'core' },
  { id: 'pathala_ganga', name: 'Pathala Ganga (Ropeway)', coords: [16.0820, 78.8750], type: 'waypoint' },
  { id: 'sakshi_ganapathi', name: 'Sakshi Ganapathi', coords: [16.0645, 78.8610], type: 'waypoint' },
  { id: 'phaladhara', name: 'Phaladhara Panchadhara', coords: [16.0620, 78.8550], type: 'waypoint' }
];

const SACRED_KNOWLEDGE = {
  darshan: {
    free: 'Dharma Darshanam. General queue. [Wait: Synchronized via Live Telemetry].',
    seeghra: 'Rs. 150 ticket. Faster access. [Wait: Synchronized via Live Telemetry].',
    athiseeghra: 'Rs. 300 ticket. Minimal wait. High priority entry.',
    sparsha: 'Rs. 500 ticket. Allows physical contact (Sparsha) with the Jyotirlinga. MANDATORY: Traditional dress code (Dhoti/Saree).',
    senior_citizen: 'Priority entry via a separate queue line. Requires Aadhar/Age proof. Wheelchairs available at primary waypoint.',
    infant_entry: 'Parents with infants (under 1 year) allowed via separate shortcut entry point.'
  },
  dual_significance: {
    'JYOTIRLINGA': 'One of the 12 sacred Jyotirlingas of Lord Shiva (Mallikarjuna Swamy).',
    'SHAKTI_PEETHA': 'One of the 18 Maha Shakti Peethas (Bhramaramba Devi).',
    'PROTOCOL': 'Devotees typically visit Lord Mallikarjuna first, followed by Goddess Bhramaramba.'
  },
  pathala_ganga_intel: {
    'ROPEWAY': 'Starts from Haritha Hotel. Efficient for avoiding the 500+ step descent. 6 AM to 6 PM.',
    'SACRED_DIP': 'Taking a dip in the Krishna River backwaters (Pathala Ganga) is said to wash away all sins.'
  },
  prasadam_intelligence: {
    'FLAGSHIP': 'Srisaila Laddu. Freshly prepared daily.',
    'PAID': 'Laddu: Rs. 20 each. Special packets available at counters.',
    'LOCATION': 'Prasadam counters are near the main entrance (Gopuram) area. [Wait: Synchronized via Live Telemetry].',
    'FREE': 'Anna Prasadam (Annadanam) is served near the temple complex.'
  },
  logistics: {
    forest_gates: 'CRITICAL: Dornala and Mannanur gates CLOSE at 9:00 PM and OPEN at 6:00 AM. Wildlife sanctuary rules apply.',
    anna_prasadam: 'Free meals provided near the main temple (11 AM to 10 PM).',
    sevas: 'Rudrabhishekam (Daily), Chandihomam, Navavarana Pooja. Sparsha Darshan (Touching the Jyotirlinga) available via Rs 500 ticket.',
    festivals: 'Maha Shivaratri (Feb/Mar) is the grandest festival. Kartheeka Masam (Nov/Dec) and Ugadi are also major events with significant crowd inflow.'
  }
};

/**
 * SRISAILAM SECTOR AI (v3.0 - SOVEREIGN GUIDE)
 * Synchronized with the Universal Mission Knowledge Base (Project DNA).
 * Handles sacred Jyotirlinga logistics and Bhramaramba Shakti Peetha intelligence.
 */
export const chatWithSrisailamAi = async (prompt, status) => {
  const text = prompt.toLowerCase();
  const targetLang = prompt.includes('[LANGUAGE:TE]') ? 'te' : prompt.includes('[LANGUAGE:HI]') ? 'hi' : 'en';
  
  try {
    const projectBriefing = getProjectBriefing();

    const systemPrompt = `You are the Srisailam Mission Guide (v3.0).
    SACRED MANDATE: EVERY response MUST start with "Om Namah Shivaya".
    MISSION DATA: You possess total awareness of the [PROJECT DNA] infrastructure (30s heartbeat, live scrapers, aura shifting).
    YOUR ROLE: Provide tactical, forest-aware intelligence for the Bhramaramba Mallikarjuna mission.
    SPECIAL ENTRY INTELLIGENCE: Proactively identify if the user qualifies for Senior/Infant priority or Sparsha requirements. Use the KNOWLEDGE base to provide precise tactical briefings.
    METEOROLOGICAL INTELLIGENCE: Use the provided [METEO_DATA] to proactively warn the user about weather conditions. If Rain or Clouds are detected in the Nallamala region, emphasize the importance of completing the mission before the 9:00 PM Forest Gate closure as visibility and transit speeds decrease.
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

    // Post-processing for specific Srisailam commands
    if (text.includes('pathala ganga') || text.includes('ropeway')) {
       if (response.map_commands && response.map_commands.length === 0) {
          response.map_commands.push({ action: 'set_view', center: [16.0820, 78.8750], zoom: 17 });
       }
    }
    
    if (text.includes('darshan') || text.includes('sparsha') || text.includes('gate') || text.includes('infant') || text.includes('laddu') || text.includes('prasadam')) {
       for (const [key, val] of Object.entries(SACRED_KNOWLEDGE.darshan)) {
          const searchKey = key.split('_').join(' ').toLowerCase();
          if (text.includes(searchKey) || (key === 'infant_entry' && text.includes('infant'))) {
             return { ...response, explanation: `Om Namah Shivaya. Sacred Briefing: ${val}` };
          }
       }
       if (text.includes('gate') || text.includes('forest') || text.includes('road')) {
          return { ...response, explanation: `Om Namah Shivaya. Forest Gate Alert: ${SACRED_KNOWLEDGE.logistics.forest_gates}` };
       }
       if (text.includes('laddu') || text.includes('prasadam')) {
          const pi = SACRED_KNOWLEDGE.prasadam_intelligence;
          return { 
             ...response,
             explanation: `Om Namah Shivaya. PRASADAM MISSION: ${pi.FLAGSHIP} are available. ${pi.LOCATION}. ${pi.PAID}. Live Status: ${status.prasadam_metrics?.stock_status || 'Syncing'}. Wait: ${status.prasadam_metrics?.wait_time || '--'}.`,
             visual_data: { type: 'PRIME', decision: 'GO' }
          };
       }
    }

    return response;
  } catch (e) {
    console.error("Srisailam Sector Disrupted:", e);
    return generateFallback(text, status);
  }
};

const generateFallback = (text, status, selectedLang) => {
  const LOCALIZED = {
    te: {
      briefing: "ఓం నమః శివాయ. పవిత్ర బ్రీఫింగ్: మల్లికార్జున స్వామి ప్రసాదం అందుబాటులో ఉంది.",
      recovery: "ఓం నమః శివాయ. శ్రీశైలం సెక్కర్ 03 మిషన్ లింక్ ప్రస్తుతం అస్థిరంగా ఉంది."
    },
    hi: {
      briefing: "ॐ नमः शिवाय। पवित्र ब्रीफिंग: मल्लिकार्जुन स्वामी प्रसाद उपलब्ध है।",
      recovery: "ॐ नमः शिवाय। श्रीशैलम सेक्टर 03 मिशन लिंक वर्तमान में अस्थिर है।"
    },
    en: {
      briefing: "Om Namah Shivaya. Sacred Briefing: Mallikarjuna Swamy Prasadam is available.",
      recovery: "Om Namah Shivaya. Srisailam Sector 03 Mission Link is currently unstable due to a sacred grid disruption."
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
      center: [16.0740, 78.8680], 
      zoom: 17,
      label: 'Sector 03 Forest Gate Status',
      id: 'temple'
    }],
    visual_data: { type: 'RECOVERY_MODE', decision: 'CAUTION' } 
  };
};
