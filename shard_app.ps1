$path = "d:\MY DATA\Projects\Working\Tirupati_AI\src\App.jsx"
$content = Get-Content -Path $path -Raw

# 1. Update handleAiMessage Logic (Ensure it's correct)
$newAi = 'const handleAiMessage = useCallback(async (prompt) => {
      const text = prompt.toLowerCase();
      let aiServiceMod;

      // 1. Fetch Sacred Database Context (V8.0)
      const dbHistory = await fetchAiContext();

      // 2. DYNAMIC NEURAL SHARDING (V10.0)
      if (text.includes(''all temple'') || text.includes(''all darshan'') || text.includes(''every temple'') || text.includes(''global report'') || !activeSector) {
         aiServiceMod = await import(''./services/globalAi'');
      } else if (activeSector === ''tirupati'') aiServiceMod = await import(''./services/tirupatiAi'');
      else if (activeSector === ''srisailam'') aiServiceMod = await import(''./services/srisailamAi'');
      else if (activeSector === ''simhachalam'') aiServiceMod = await import(''./services/simhachalamAi'');
      else if (activeSector === ''annavaram'') aiServiceMod = await import(''./services/annavaramAi'');
      else if (activeSector === ''sabarimala'') aiServiceMod = await import(''./services/sabarimalaAi'');
      else aiServiceMod = await import(''./services/vijayawadaAi'');

      const executeAi = aiServiceMod.chatWithGlobalAi || aiServiceMod.chatWithTirupatiAi || aiServiceMod.chatWithSrisailamAi || aiServiceMod.chatWithSimhachalamAi || aiServiceMod.chatWithAnnavaramAi || aiServiceMod.chatWithSabarimalaAi || aiServiceMod.chatWithVijayawadaAi;

      const response = await executeAi(prompt, liveData, dbHistory);'

# If handleAiMessage is already updated, this might not find it, which is fine.

# 2. Fix the Bottom Suspense / Braces
$oldBottom = '            )}
         </div>
   );
};'

$newBottom = '            )}
         </div>
      </Suspense>
   );
};'

$content = $content.Replace($oldBottom, $newBottom)

Set-Content -Path $path -Value $content -Encoding utf8
