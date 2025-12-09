import { GoogleGenAI, Type } from "@google/genai";
import { GiftRecommendation } from "../types";

// Initialize the client
// Note: We use process.env.API_KEY as strictly required by system instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGiftIdeas = async (description: string): Promise<GiftRecommendation[]> => {
  try {
    const model = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: model,
      contents: `Based on the following description of a person, provide exactly 3 specific gift recommendations. 
      Description: "${description}"`,
      config: {
        systemInstruction: "You are an empathetic and intelligent shopping assistant. Based on the user's description, provide EXACTLY 3 specific gift recommendations (not general categories). Be creative but practical.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The specific name of the product or gift idea."
              },
              reason: {
                type: Type.STRING,
                description: "An emotional and logical explanation of why this gift fits the person described."
              },
              price_range: {
                type: Type.STRING,
                description: "Estimated price range in IDR (e.g. 'Rp 100rb - 300rb')."
              }
            },
            required: ["name", "reason", "price_range"],
            propertyOrdering: ["name", "reason", "price_range"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as GiftRecommendation[];
      return data;
    } else {
      throw new Error("No data returned from AI");
    }

  } catch (error) {
    console.error("Error generating gifts:", error);
    throw error;
  }
};