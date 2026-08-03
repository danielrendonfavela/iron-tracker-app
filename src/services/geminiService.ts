import { Workout, AIOperation } from '../types/gym';
import { WhoopSummary } from '../types/whoop';

export const fetchWithRetry = async (url: string, opts: RequestInit, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, opts);
      if (response.ok) return await response.json();
      const errorText = await response.text();
      console.warn(`Fetch retry ${i + 1} failed with status ${response.status}:`, errorText);
    } catch (e) {
      if (i === retries - 1) throw e;
    }
    await new Promise(res => setTimeout(res, 1500 * (i + 1)));
  }
  throw new Error('No se pudo establecer conexión con el servidor.');
};

export const queryIronCoach = async (
  userMessage: string,
  workouts: Workout[],
  apiKey: string,
  whoopData?: WhoopSummary
): Promise<{ text: string; ops?: AIOperation[] }> => {
  if (!apiKey.trim()) {
    return {
      text: '⚠️ **API Key no configurada**.\n\nPor favor ingresa tu API Key de Gemini en la configuración del Coach para interactuar con la IA.'
    };
  }

  const historySummary = workouts
    .slice(0, 20)
    .map(w => {
      const blocksText = (w.blocks || [])
        .map(b => `${b.reps}x${b.weight}${b.unit}`)
        .join(', ');
      return `ID:[${w.id}] FECHA:[${w.date}] EX:[${w.exerciseName}] -> ${blocksText}`;
    })
    .join('\n');

  const todayStr = new Date().toISOString().split('T')[0];

  const whoopContext = whoopData
    ? `DATOS DE RECUPERACIÓN Y SALUD DE WHOOP DEL USUARIO HOY:
- Estado de Recuperación: ${whoopData.recovery.state} (${whoopData.recovery.recoveryScore}%)
- HRV: ${whoopData.recovery.hrv} ms | Frecuencia Cardíaca en Reposo: ${whoopData.recovery.restingHeartRate} bpm
- Nivel de Esfuerzo (Strain): ${whoopData.strain.strainScore} / 21
- Horas de Sueño: ${whoopData.sleep.hoursSlept}h (Calidad: ${whoopData.sleep.sleepQualityPercentage}%)

INSTRUCCIÓN ESPECIAL SOBRE WHOOP:
Si la recuperación de Whoop es RED (baja recovery < 33%), adviértele amistosamente al usuario que su SNC está fatigado y sugiérele autorregular, bajar el peso un 15% o hacer un día de descarga (Deload).
Si es GREEN (> 66%), anímalo a buscar un récord personal (PR) con sobrecarga progresiva.
Si es YELLOW (33-66%), dile que mantenga su volumen estándar.`
    : 'Datos de Whoop no vinculados aún.';

  const systemInstruction = `Eres IRON COACH, IA experta en culturismo, entrenamiento de fuerza, auto-regulación biológica y administrador de base de datos de gimnasio.

${whoopContext}

HISTORIAL ACTUAL DEL USUARIO:
${historySummary || 'Sin registros aún.'}

INSTRUCCIONES DE OPERACIÓN Y EDICIÓN:
Si el usuario te pide crear, modificar o borrar registros de su entrenamiento, responde con su mensaje motivacional tipo "Gym Bro" y al final de tu mensaje incluye OBLIGATORIAMENTE este bloque JSON:
\`\`\`json
{
  "ops": [
    {"type": "CREATE", "data": {"name": "Nombre Ejercicio", "date": "YYYY-MM-DD", "blocks": [{"sets":4,"reps":10,"weight":80,"unit":"kg"}]}},
    {"type": "UPDATE", "id": "ID_EXACTO_DEL_HISTORIAL", "data": {"name": "Nombre Ejercicio", "date": "YYYY-MM-DD", "blocks": [{"sets":4,"reps":12,"weight":100,"unit":"kg"}]}},
    {"type": "DELETE", "id": "ID_EXACTO_DEL_HISTORIAL"}
  ]
}
\`\`\`

Hoy es ${todayStr}. Mantén una actitud directa, motivadora, enfocada en la hipertrofia y sobrecarga progresiva.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

  try {
    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const replyText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta del Coach.';
    const jsonMatch = replyText.match(/```json\n([\s\S]*?)\n```/) || replyText.match(/```json([\s\S]*?)```/);

    let ops: AIOperation[] | undefined = undefined;
    let cleanReply = replyText;

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        if (parsed.ops && Array.isArray(parsed.ops)) {
          ops = parsed.ops;
          cleanReply = replyText.replace(jsonMatch[0], '').trim() + '\n\n*(✅ Operación ejecutada en tu historial)*';
        }
      } catch (e) {
        console.error('Error parseando JSON de operaciones:', e);
      }
    }

    return { text: cleanReply, ops };
  } catch (err: any) {
    console.error('Error contacting Gemini:', err);
    return {
      text: `❌ **Error de conexión con Gemini**: ${err.message || 'Verifica tu API Key o conexión a internet.'}`
    };
  }
};
