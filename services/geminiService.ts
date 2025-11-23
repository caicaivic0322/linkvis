import { GoogleGenAI } from "@google/genai";
import { OperationType } from "../types";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const explainOperation = async (op: OperationType, listSize: number, contextValue?: number | string) => {
  if (!API_KEY) return "API Key 未配置，无法获取 AI 解析。";

  const prompt = `
    你是一位 C++ 数据结构专家。
    请解释链表操作: "${op}"。基于标准教科书中的 C++ 实现。
    
    当前链表长度: ${listSize}。
    操作参数: ${contextValue ?? 'N/A'}。

    1. 解释该特定场景下的时间复杂度 (Big O) (例如是 O(1) 还是 O(n)?)。
    2. 解释内存中发生了什么 (指针重分配)。
    3. 如果涉及遍历，请简述遍历过程。
    
    请保持简洁 (最多 3 句话)。直接输出纯文本。请用中文回答。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "生成解释时出错。";
  }
};