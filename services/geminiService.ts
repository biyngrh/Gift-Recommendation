import { GoogleGenAI, Type } from "@google/genai";
import { GiftRecommendation, Language } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateOptions {
  description: string;
  imageBase64?: string; // Optional base64 image string
  occasion: string;
  budget: string;
  language: Language;
  zodiac?: string; // New Optional Field
  music?: string;  // New Optional Field
}

interface AlchemyOptions {
  elementA: string;
  elementB: string;
  language: Language;
}

export const generateGiftIdeas = async ({ 
  description, 
  imageBase64, 
  occasion, 
  budget,
  language,
  zodiac,
  music
}: GenerateOptions): Promise<GiftRecommendation[]> => {
  try {
    const model = "gemini-2.5-flash";

    const isId = language === 'id';
    
    // Construct the prompt context based on language
    let promptText = "";

    // Additional context string for Deep Dive inputs
    const deepDiveContextId = `
      INFO TAMBAHAN (Sangat Penting):
      ${zodiac ? `- Zodiak Penerima: ${zodiac}` : ''}
      ${music ? `- Selera Musik/Vibe: ${music}` : ''}

      INSTRUKSI KHUSUS ZODIAK & MUSIK:
      Jika data Zodiak atau Musik diberikan, gunakan itu untuk mempersonalisasi gaya kado secara mendalam.
      Contoh logika: 
      - Zodiak Leo + Musik Pop = Kado yang 'Stand out', Trendy, dan pusat perhatian.
      - Zodiak Virgo + Musik Klasik = Kado yang terorganisir, bersih, minimalis, dan elegan.
      - Zodiak Pisces + Musik Indie = Kado yang dreamy, artistik, dan sentimental.
    `;

    const deepDiveContextEn = `
      ADDITIONAL INFO (Very Important):
      ${zodiac ? `- Recipient Zodiac: ${zodiac}` : ''}
      ${music ? `- Music Taste/Vibe: ${music}` : ''}

      SPECIAL INSTRUCTIONS FOR ZODIAC & MUSIC:
      If Zodiac or Music data is provided, use it to deeply personalize the gift style.
      Logic examples:
      - Zodiac Leo + Pop Music = Gifts that are 'Stand out', Trendy, and attention-grabbing.
      - Zodiac Virgo + Classical Music = Gifts that are organized, clean, minimalist, and elegant.
      - Zodiac Pisces + Indie Music = Gifts that are dreamy, artistic, and sentimental.
    `;

    if (isId) {
      promptText = `
      Bertindaklah sebagai Orakel Kado (Gift Oracle).
      
      KONTEKS UTAMA:
      - Acara: ${occasion}
      - Batas Anggaran: ${budget}
      - Deskripsi Penerima: "${description}"
      - Bahasa Output: Bahasa Indonesia

      ${(zodiac || music) ? deepDiveContextId : ''}
      
      TUGAS:
      Analisis input (dan gambar jika ada) untuk mendeteksi "Aura" atau estetika penerima.
      Berikan TEPAT 3 rekomendasi kado yang spesifik.
      
      KENDALA:
      - Jika acaranya 'Permintaan Maaf', saran harus sentimental/penuh usaha.
      - Jika anggaran 'Mode Sultan', sarankan barang mewah.
      - Jika ada gambar, gunakan isyarat visual (warna, objek, gaya) untuk mencocokkan kado.
      - Gunakan Bahasa Indonesia yang luwes dan sedikit puitis/ajaib untuk alasannya.
      `;
    } else {
      promptText = `
      Act as a Gift Oracle.
      
      MAIN CONTEXT:
      - Occasion: ${occasion}
      - Budget Limit: ${budget}
      - Recipient Description: "${description}"
      - Output Language: English

      ${(zodiac || music) ? deepDiveContextEn : ''}
      
      TASK:
      Analyze inputs (and image if present) to detect the recipient's "Aura" or aesthetic.
      Provide EXACTLY 3 specific gift recommendations.
      
      CONSTRAINTS:
      - If occasion is 'Apology', suggestions must be sentimental/effortful.
      - If budget is 'Sultan Mode', suggest luxury items.
      - If image exists, use visual cues (colors, objects, style) to match gifts.
      - Use fluent, slightly poetic/magical English for the reasoning.
      `;
    }

    const parts: any[] = [{ text: promptText }];

    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", 
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: isId 
          ? "Kamu adalah asisten belanja yang empatik dan ajaib. Berikan rekomendasi spesifik dalam format JSON."
          : "You are an empathetic and magical shopping assistant. Provide specific recommendations in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: isId ? "Nama spesifik produk (Bahasa Indonesia)." : "Specific product name (English)."
              },
              reason: {
                type: Type.STRING,
                description: isId 
                  ? "Penjelasan emosional menghubungkan kado dengan aura (Bahasa Indonesia)." 
                  : "Emotional explanation connecting the gift to the aura (English)."
              },
              price_range: {
                type: Type.STRING,
                description: isId ? "Estimasi harga dalam IDR." : "Estimated price in USD/Local Currency."
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

export const generateAlchemyIdeas = async ({
  elementA,
  elementB,
  language
}: AlchemyOptions): Promise<GiftRecommendation[]> => {
  try {
    const model = "gemini-2.5-flash";
    const isId = language === 'id';

    const promptText = isId 
      ? `
      Bertindaklah sebagai Alkemis Kado Kreatif.
      User ingin menggabungkan dua konsep: "${elementA}" dan "${elementB}" menjadi satu hadiah kreatif.
      
      TUGAS:
      Cari barang NYATA (bukan fiksi) yang merupakan persilangan (crossover) dari kedua hal ini.
      Berikan 3 ide unik.
      
      Contoh Logika:
      - 'Golf' + 'Star Wars' = 'Chewbacca Headcover' atau 'Lightsaber Putter'.
      - 'Kucing' + 'Sushi' = 'Kostum Sushi Kucing' atau 'Mainan Nekomaki'.
      - 'Kopi' + 'Fotografi' = 'Mug Lensa Kamera'.
      
      Output dalam Bahasa Indonesia.
      `
      : `
      Act as a Creative Gift Alchemist.
      User wants to fuse two concepts: "${elementA}" and "${elementB}" into one creative gift.
      
      TASK:
      Find REAL items (not fictional) that are a crossover of these two things.
      Provide 3 unique ideas.
      
      Logic Examples:
      - 'Golf' + 'Star Wars' = 'Chewbacca Headcover' or 'Lightsaber Putter'.
      - 'Cats' + 'Sushi' = 'Cat Sushi Costume' or 'Nekomaki Toys'.
      - 'Coffee' + 'Photography' = 'Camera Lens Mug'.
      
      Output in English.
      `;

    const response = await ai.models.generateContent({
      model: model,
      contents: promptText,
      config: {
        systemInstruction: isId 
          ? "Kamu adalah Alkemis Kreatif. Gabungkan konsep menjadi barang nyata. Output JSON."
          : "You are a Creative Alchemist. Fuse concepts into real items. Output JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Name of the crossover product."
              },
              reason: {
                type: Type.STRING,
                description: "Explanation of how it combines both elements."
              },
              price_range: {
                type: Type.STRING,
                description: "Estimated price."
              }
            },
            required: ["name", "reason", "price_range"],
            propertyOrdering: ["name", "reason", "price_range"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GiftRecommendation[];
    } else {
      throw new Error("No Alchemy data returned");
    }

  } catch (error) {
    console.error("Error generating alchemy gifts:", error);
    throw error;
  }
};