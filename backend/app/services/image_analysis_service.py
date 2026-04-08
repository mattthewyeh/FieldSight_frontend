import google. generativeai as genai
import os
import json

genai. configure (api_key =os. getenv ("GEMINI _API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

async def analyze_image(image_bytes: bytes) -> dict:
    response = model.generate_content([
        {
            "mime_type": "image/jpeg",
            "data": image_bytes
        },
       """
You are a plant health visual assessment assistant. Analyze the provided plant image using only visible evidence.

Evaluate visible indicators:
- Leaf discoloration (yellowing, browning, blackening, pale color)
- Spotting patterns (circular lesions, irregular spots, fungal-like patterns)
- Edge burn or necrosis
- Wilting or drooping
- Mold, mildew, or powdery coatings
- Leaf curling or deformation
- Stem damage
- Uneven coloration
- Pest-like chewing or mining damage
- Patchy chlorophyll loss
- Dry or brittle tissue

Severity rules:
- 0 = healthy, no visible symptoms
- 5 = moderate, clear damage, spreading
- 10 = severe, large portions affected, major decline
- severity must be 0 if disease_status is HEALTHY

Rules:
- Report only visually supported findings
- If image is unclear or evidence is weak, set confidence_score below 50
- Only use symptoms from this list:
  - yellowing
  - browning
  - brown spots
  - wilting
  - leaf curl
  - edge burn
  - mold
  - stem damage
  - pest damage
  - dry tissue
  - blackening
  - pale color
  - powdery coating
  - circular lesions
  - irregular spots
  - patchy chlorophyll loss

Return raw JSON only, no markdown, no extra text:
{
    "disease_status": "DISEASED" or "HEALTHY",
    "severity": 0, 5, or 10,
    "confidence_score": 0 to 100,
    "symptoms_observed": ["symptom 1", "symptom 2"],
    "short_explanation": "2-3 sentences describing what symptoms were visible and where on the plant"
}
"""
    ])

    result = json.loads(response.text.strip())
    return result

   