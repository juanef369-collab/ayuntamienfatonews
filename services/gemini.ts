
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle } from "../types";

const cleanJsonResponse = (text: string | undefined) => {
  if (!text) return "{}";
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'dummy-key') {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const NEWS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { 
      type: Type.STRING, 
      description: 'Titular escandaloso, clickbait de oficina, máximo 10 palabras. Muy canalla.' 
    },
    subtitle: { 
      type: Type.STRING, 
      description: 'Una frase lapidaria que resume el drama burocrático.' 
    },
    content: { 
      type: Type.STRING, 
      description: 'Cuerpo de la noticia de unos 3-4 párrafos. Humor ácido, términos de oficina (KPIs, sinergias, planta 3, becarios, vending) y un toque de corrupción cómica.' 
    },
    category: { 
      type: Type.STRING, 
      description: 'Categoría inventada (ej: Burocracia Extrema, Crisis del Tupper, Sobres de Azúcar).' 
    },
    author: { 
      type: Type.STRING, 
      description: 'Nombre de periodista con alias (ej: Juan "El Filtrador" Pérez).' 
    },
    imagePrompt: { 
      type: Type.STRING, 
      description: 'Descripción visual detallada para generar una imagen satírica de la escena.' 
    },
    comments: {
      type: Type.ARRAY,
      description: 'Comentarios de compañeros de oficina indignados o burlones.',
      items: {
        type: Type.OBJECT,
        properties: {
          author: { type: Type.STRING, description: 'Nombre y cargo absurdo (ej: Mari, la de Contabilidad).' },
          text: { type: Type.STRING, description: 'Comentario corto y gracioso.' },
          avatarSeed: { type: Type.STRING, description: 'Nombre para generar avatar.' }
        },
        required: ['author', 'text', 'avatarSeed']
      }
    }
  },
  required: ['title', 'subtitle', 'content', 'category', 'author', 'imagePrompt', 'comments']
};

const SYSTEM_INSTRUCTION = `Eres el Director Editorial de "AyuntamienFatoNews", el diario digital más canalla, ácido y satírico del mundo corporativo y municipal. 
Tu estilo es una mezcla entre periodismo de investigación serio y el chisme más bajo de pasillo. 
Utilizas términos como "sinergias", "ventanilla 4", "becario no remunerado", "reunión de Zoom que pudo ser un mail" y "comisión de investigación de la cafetera".
Tu misión es convertir cualquier nimiedad de oficina en un escándalo de proporciones bíblicas. Siempre en castellano de España.`;

export const generateNewsFromVoice = async (transcript: string): Promise<NewsArticle> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `TRANSCRIPCIÓN DEL CHISME: "${transcript}". 
    Instrucciones: Crea una noticia de portada basándote en este rumor. Exagéralo al máximo. Añade detalles sobre la Planta 3 y la máquina de vending.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: NEWS_SCHEMA,
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 1.0, // Mayor creatividad para el humor
    }
  });

  const data = JSON.parse(cleanJsonResponse(response.text));
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  };
};

export const generateBreakingNews = async (): Promise<NewsArticle> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Genera una noticia de ÚLTIMA HORA (Breaking News) sobre un incidente absurdo en un ayuntamiento o empresa española. El tema debe ser ridículo: desde un secuestro de grapadoras hasta una guerra civil por el aire acondicionado.",
    config: {
      responseMimeType: "application/json",
      responseSchema: NEWS_SCHEMA,
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    }
  });

  const data = JSON.parse(cleanJsonResponse(response.text));
  return {
    ...data,
    id: 'breaking-' + Date.now(),
    date: 'EDICIÓN EXTRAORDINARIA'
  };
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    // Refinamos el prompt para gemini-2.5-flash-image
    const imageStylePrompt = `A high-quality editorial illustration for a modern newspaper, satirical cartoon style, clean lines, slightly desaturated colors like an old paper but modern. Scene: ${prompt}. Set in a messy Spanish government office or corporate environment. Funny, cinematic.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: imageStylePrompt }] 
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });
    
    const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : `https://picsum.photos/seed/${Math.random()}/1200/675`;
  } catch (err) {
    console.error("Error generating image:", err);
    return `https://picsum.photos/seed/${Math.random()}/1200/675`;
  }
};
