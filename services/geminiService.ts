
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserAnswer } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash";

export const explainTopic = async (topic: string, subject: string, grade: string): Promise<string> => {
  try {
    const prompt = `Explain the topic "${topic}" for a student in grade ${grade} who is studying ${subject}.
    Explain it in a simple, engaging, and step-by-step way. Use analogies and examples that a student of this age would understand.
    Format your response nicely using markdown, for example, use headings, bold text, and lists.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt
    });
    
    return response.text;
  } catch (error) {
    console.error("Error explaining topic:", error);
    return "I'm sorry, I encountered an error while trying to explain that. Please try again.";
  }
};

export const generateExamQuestions = async (subject: string, grade: string, numQuestions: number): Promise<Question[]> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Generate a ${numQuestions}-question multiple-choice quiz on the subject of ${subject} for a student in grade ${grade}. For each question, provide 4 options, and the correct answer must be one of the options.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    correctAnswer: { type: Type.STRING }
                                },
                                required: ["question", "options", "correctAnswer"]
                            }
                        }
                    },
                    required: ["questions"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.questions || [];
    } catch (error) {
        console.error("Error generating exam:", error);
        return [];
    }
};

export const getExamFeedback = async (subject: string, grade: string, results: UserAnswer[], score: number, total: number): Promise<string> => {
    try {
        const prompt = `A student in grade ${grade} took a quiz on ${subject}. Their final score was ${score}/${total}.
        Here are the questions, their chosen answers, and the correct answers: ${JSON.stringify(results)}.
        Based on their incorrect answers, provide a constructive and encouraging report.
        1. Give a brief, positive summary of their performance.
        2. Identify the key topics where they struggled based on the incorrect answers.
        3. Provide 3 specific, actionable tips, study techniques, or simple explanations for the difficult topics to help them improve.
        Keep the tone positive and motivating, like a helpful tutor. Format the response in markdown.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Error generating feedback:", error);
        return "There was an error generating feedback for this exam.";
    }
};
