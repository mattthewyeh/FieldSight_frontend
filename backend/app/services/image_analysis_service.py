import google. generativeai as genai
import os

genai. configure (api_key =os. getenv ("GEMINI _API_KEY"))
model = genai.GenerativeModel("gemini - 1.5 -flash")

async def analyze_image(image_bytes: bytes) -> dict:
    response = model.generate_content([
        {
            "mime_type": "image/jpeg",
            "data": image_bytes
        },
        """
        You are a plant health visual assessment assistant. Analyze the provided plant image using only visible evidence.

Task:
Assess plant health from the image only. Do not infer hidden conditions, lab results, or non-visible causes.

Evaluate visible indicators:
- Leaf discoloration (yellowing, browning, blackening, pale color)
- Spotting patterns (circular lesions, irregular spots, fungal-like patterns)
- Edge burn or necrosis
- Wilting or drooping
- Mold, mildew, powdery coatings
- Leaf curling or deformation
- Stem damage
- Uneven coloration
- Pest-like chewing/mining damage
- Patchy chlorophyll loss
- Dry/brittle tissue

Possible causes (choose one):
- fungal infection
- bacterial infection
- viral infection
- nutrient deficiency
- water stress
- heat stress
- physical damage
- pest damage
- natural aging
- unknown

Severity scale (integer only):
- 0: completely healthy
- 1: very mild stress (barely visible discoloration)
- 2: mild stress (early yellowing or minor spotting)
- 3: moderate stress (clear yellowing, small lesions, early structural damage)
- 4: significant disease/stress (widespread spotting/necrosis/deformation)
- 5: severe disease/stress (large portions affected; likely major decline)
- 6: critical condition (plant appears near death/severely infected)

Rules:
- Report only visually supported findings.
- If evidence is weak/unclear, use:
  - `"likely_cause": "unknown"`
  - `"confidence": "low"`
- If plant appears healthy, still return full JSON with severity_score = 0.
- If no symptoms are visible, return `"detected_symptoms": []`.
- estimated_damage_percentage must represent visible affected area only.

Output requirements:
- Return raw JSON only (no markdown, no extra text).
- Use exactly this schema and key order.
- `severity_score` must be an integer 0-6.
- `estimated_damage_percentage` must be a string like `"0%"` to `"100%"`.
- `confidence` must be one of: `"low"`, `"medium"`, `"high"`.

{
  "plant_health_status": "healthy | mildly_stressed | diseased | severely_diseased",
  "detected_symptoms": [
    "symptom 1",
    "symptom 2"
  ],
  "likely_cause": "fungal infection | bacterial infection | viral infection | nutrient deficiency | water stress | heat stress | physical damage | pest damage | natural aging | unknown",
  "severity_score": 0,
  "estimated_damage_percentage": "0%",
  "confidence": "low | medium | high",
  "short_explanation": "brief visual-evidence-based explanation"
  """
    ])

    result = json.loads(esponse.text.strip())
    return result

   