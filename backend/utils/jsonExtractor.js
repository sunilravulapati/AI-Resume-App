//this function is used to extract the json from the text
export function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("AI response did not contain valid JSON");
  }
  return JSON.parse(match[0]);
}