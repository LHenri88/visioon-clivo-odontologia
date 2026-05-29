import { GoogleGenAI } from '@google/genai';
const PROCEDURE_PROMPTS = {
  "facetas-porcelana": "Realistic dental aesthetic preview. Render natural-looking porcelain veneers on the front upper teeth (canine to canine). Maintain perfect tooth proportions (golden ratio, central incisor slightly dominant), translucent enamel edges, subtle texture, natural gum line. PRESERVE: lip shape, skin tone, facial features, lighting. DO NOT whiten artificially — target a natural BL2-BL3 shade. Output as a photorealistic before/after of the SAME person.",
  "implante-dentario": "Realistic dental implant simulation. Fill missing teeth gaps with anatomically correct prosthetic crowns matching the surrounding teeth in shade, shape and alignment. Respect natural occlusion and arch curve. PRESERVE: gum tissue, lip support, smile line, all facial features. Photorealistic output.",
  "lente-contato-dental": "Ultra-thin contact lens veneers preview. Slightly improve shape, alignment and shade of front teeth without overcorrection. Keep edges translucent and proportions natural. PRESERVE: gum line, lip framing, skin, lighting.",
  "clareamento": "Professional teeth whitening simulation. Move teeth shade up by 3-4 tabs on the Vita scale to a natural BL2 tone, preserving micro-texture and translucency. PRESERVE: gums, lips, skin, lighting. Avoid bleached/painted look."
};
const CLINIC = { slug: 'clivo-odontologia', name: "Clivo Odontologia", tone: "Técnico-educacional, autoridade clínica. Posiciona-se como referência em ensino além de tratamento." };

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userB64, userMime, procedure } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY_MISSING' });
  const basePrompt = PROCEDURE_PROMPTS[procedure];
  if (!basePrompt) return res.status(400).json({ error: 'Procedure not supported' });
  const fullPrompt = [basePrompt, `Preview for ${CLINIC.name}.`, 'CRITICAL: photorealistic clinical preview, preserve patient identity perfectly.'].join('\n');
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [{ inlineData: { data: userB64, mimeType: userMime } }, { text: fullPrompt }] },
    });
    return res.status(200).json({ ok: true, clinic: CLINIC.name, procedure, response });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
