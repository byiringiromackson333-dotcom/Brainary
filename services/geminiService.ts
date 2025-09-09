
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserAnswer, GeneratedStudyDay } from "../types";

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

export const generateRelatedTopics = async (topic: string, subject: string, grade: string): Promise<string[]> => {
    try {
        const prompt = `Based on the topic "${topic}" in the subject of ${subject} for a grade ${grade} student, suggest 3 to 5 related topics or sub-topics they could explore next. The suggestions should be concise.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topics: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["topics"]
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.topics || [];

    } catch (error) {
        console.error("Error generating related topics:", error);
        return [];
    }
};

export const generateExamQuestions = async (subject: string, grade: string, numQuestions: number, difficulty: number): Promise<Question[]> => {
    try {
        const prompt = `Generate a ${numQuestions}-question multiple-choice quiz for a student in grade ${grade} studying the subject "${subject}".

The desired difficulty level for this quiz is ${difficulty} on a scale of 1 to 43, where 1 is extremely easy and 43 is expert-level.

Please adhere to the following instructions based on the difficulty level:
- **Question Complexity:** For difficulty level ${difficulty}, create questions that are appropriately challenging. Lower levels should have straightforward questions, while higher levels should involve multi-step problems, abstract reasoning, or synthesis of multiple concepts.
- **Concept Depth:** Test concepts at a depth suitable for difficulty ${difficulty}. Lower levels should focus on foundational knowledge and definitions. Higher levels should probe deeper understanding, exceptions, and nuanced applications of the concepts.
- **Distractor Subtlety:** The incorrect multiple-choice options (distractors) should be plausible but clearly wrong for lower difficulties. For difficulty ${difficulty}, make the distractors more subtle and plausible, requiring a precise understanding to identify the correct answer. Common misconceptions make good distractors at higher levels.

For each question, provide 4 options, and the correct answer must be one of the options.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
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

export const generateStudyPlan = async (subject: string, grade: string, goal: string, duration: string): Promise<GeneratedStudyDay[]> => {
  try {
    const prompt = `Create a structured, day-by-day study plan for a student in grade ${grade} studying ${subject}.
    Their specific goal is: "${goal}".
    The desired duration for this plan is: "${duration}".

    For each day, provide:
    - A title for the day (e.g., "Day 1", "Monday").
    - The main topic(s) to focus on.
    - 2-4 specific, actionable learning tasks.

    The plan should be realistic and motivating.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    plan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.STRING, description: "The title for the day, e.g., Day 1." },
                                topic: { type: Type.STRING, description: "Main topic(s) for the day." },
                                tasks: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "List of actionable learning tasks for the day."
                                }
                            },
                            required: ["day", "topic", "tasks"]
                        }
                    }
                },
                required: ["plan"]
            }
        }
    });
    
    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    return parsed.plan || [];
  } catch (error) {
    console.error("Error generating study plan:", error);
    return [];
  }
};
