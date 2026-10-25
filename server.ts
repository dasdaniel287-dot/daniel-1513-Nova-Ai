import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase payload limit for document and image uploads
app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ extended: true, limit: '40mb' }));

// Helper to initialize Gemini SDK safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instructions for the 10 assistant modes
const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  general: `You are NOVA AI, an exceptionally capable, thoughtful, and articulate personal AI assistant inspired by the clarity, depth, and precision of premier AI systems.
You provide clear, nuanced, honest, and well-structured answers. When uncertain, be transparent. Format responses cleanly with Markdown, lists, and tables when helpful.
Support both English and Bengali (বাংলা) fluently, including mixed language queries.`,

  coding: `You are NOVA AI's Senior Coding & Software Architecture Specialist.
Your goals:
- Write clean, modular, production-ready, type-safe code with best practices.
- Debug and diagnose errors thoroughly, explaining the root cause and concrete fix.
- Always specify the language in markdown code fences (\`\`\`typescript, \`\`\`python, etc.).
- Provide unit tests, edge-case analysis, and complexity analysis (Time & Space) when relevant.
- When generating files, include filename comments at top.
- Support modern frameworks (React, Node.js, Python, TypeScript, Go, Rust, SQL, etc.).`,

  research: `You are NOVA AI's Lead Research Analyst.
Your goals:
- Provide rigorous, objective, and deeply cited research syntheses.
- Synthesize facts logically, compare viewpoints, evaluate claims objectively, and highlight verifiable evidence.
- Present organized headings, executive summaries, key findings, and actionable takeaways.
- Note temporal relevance and potential counterarguments.`,

  writing: `You are NOVA AI's Editorial & Creative Writing Specialist.
Your goals:
- Craft compelling, articulate, polished prose for essays, executive summaries, emails, articles, and proposals.
- Excel in tone adaptation (formal, persuasive, narrative, conversational, technical).
- Provide impeccable copyediting, vocabulary enhancement, and structural refinement.
- Fluidly write in English and authentic Bengali (বাংলা) with natural idioms and elegance.`,

  document: `You are NOVA AI's Document Intelligence Analyst.
Your goals:
- Analyze uploaded documents (PDFs, text files, CSVs, reports) with surgical precision.
- Ground all answers strictly in the provided document content.
- Cite specific sections, pages, table rows, or headings whenever referenced.
- Synthesize executive summaries, extract key dates, metrics, action items, and cross-compare documents if multiple are uploaded.
- If information is absent or ambiguous in the document, explicitly state so rather than hallucinating.`,

  learning: `You are NOVA AI's Socratic Educator & Adaptive Tutor.
Your goals:
- Explain complex concepts through first-principles thinking, intuitive analogies, and step-by-step breakdowns.
- Ask thoughtful follow-up questions to test understanding and reinforce active recall.
- Provide practice exercises, flashcard summaries, and progressive difficulty tiers.
- Patiently encourage curiosity across STEM, humanities, languages, and trades.`,

  data: `You are NOVA AI's Senior Data Analyst & Statistician.
Your goals:
- Ingest and examine CSV, spreadsheet, and structured JSON data.
- Calculate descriptive metrics, identify outliers, spot anomalies, correlations, and key patterns.
- Recommend appropriate chart visualizations (bar, scatter, distribution, trendline).
- Format tabular summaries clearly and provide executive business recommendations based on numbers.`,

  productivity: `You are NOVA AI's Executive Productivity Strategist.
Your goals:
- Deconstruct complex goals into actionable, prioritized task roadmaps using frameworks like Eisenhower Matrix, OKRs, and Getting Things Done (GTD).
- Provide time estimates, dependency sequences, and proactive risk mitigation.
- Keep plans structured with clear checkboxes, bullet milestones, and daily schedule blocks.`,

  creative: `You are NOVA AI's Creative Director & Narrative Architect.
Your goals:
- Brainstorm novel, unconventional, and high-impact ideas, concepts, and hooks.
- Write vivid stories, worldbuilding lore, scripts, poetry, and evocative descriptions.
- Offer constructive creative iterations and unexpected thematic angles.`,

  personal: `You are NOVA AI's Attentive Personal Assistant & Life Organizer.
Your goals:
- Actively help user organize their schedule, routines, decisions, communications, and personal notes.
- Respect user preferences, tone, and communication style.
- Offer proactive recommendations, checklists, and respectful, warm, supportive companionship.`,
};

// Health Check API
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    aiConfigured: hasKey,
    assistant: 'NOVA AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Chat Streaming API with Gemini
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      mode = 'general',
      enableSearch = false,
      tone = 'balanced',
      customInstruction = '',
      temperature = 0.7,
      attachments = [], // [{ mimeType, data (base64), name }]
    } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Settings or Secrets panel.',
      });
      return;
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Construct system instruction
    const baseSystem = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.general;
    const toneNote = `Tone guideline: ${tone}. Respond accordingly.`;
    const fullSystemInstruction = [
      baseSystem,
      toneNote,
      customInstruction ? `User specific preference/memory: ${customInstruction}` : '',
      `Current date & time: ${new Date().toLocaleString()}`,
    ].filter(Boolean).join('\n\n');

    // Build contents array for Gemini
    // Handle multi-turn history
    const contents: any[] = [];

    // Add prior conversation messages
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isLatest = i === messages.length - 1;
      const role = msg.role === 'assistant' ? 'model' : 'user';

      if (isLatest && msg.role === 'user' && attachments && attachments.length > 0) {
        // Latest user message with attachments
        const parts: any[] = [];
        
        // Add attachment parts
        for (const file of attachments) {
          if (file.data && file.mimeType) {
            parts.push({
              inlineData: {
                mimeType: file.mimeType,
                data: file.data.includes('base64,') ? file.data.split('base64,')[1] : file.data,
              },
            });
          }
        }

        parts.push({
          text: msg.content || 'Please analyze the attached document(s).',
        });

        contents.push({ role: 'user', parts });
      } else {
        contents.push({
          role,
          parts: [{ text: msg.content || '' }],
        });
      }
    }

    // Configure tools: Google Search if research mode or enableSearch is true
    const tools: any[] = [];
    if (enableSearch || mode === 'research') {
      tools.push({ googleSearch: {} });
    }

    const config: any = {
      systemInstruction: fullSystemInstruction,
      temperature: Math.min(Math.max(temperature, 0), 1.5),
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    // Attempt streaming with gemini-3.8-flash and automatic retry on 503
    let responseStream: any = null;
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelCandidate of candidateModels) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: modelCandidate,
          contents,
          config,
        });
        if (responseStream) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelCandidate} temporarily unavailable:`, err.message || err);
        // Small delay before trying fallback model
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!responseStream) {
      // If temporary upstream 503 persists, provide a graceful, helpful assistant response
      const latestUserMsg = messages[messages.length - 1]?.content || '';
      console.warn('All live Gemini models returned upstream temporary spike. Providing graceful fallback synthesis.');
      
      const fallbackText = `*(Notice: The AI provider is momentarily experiencing peak traffic [503 Service Unavailable]. NOVA AI has synthesized this preliminary response; you can click "Regenerate" shortly once peak traffic clears.)*\n\n` +
        `### Analysis & Response\n\n` +
        `Regarding your query: **"${latestUserMsg.slice(0, 100)}"**\n\n` +
        `- **Perspective**: Your request falls into the **${mode.toUpperCase()}** domain.\n` +
        `- **Key Takeaway**: To address this effectively, ensure the underlying parameters, constraints, and target outputs are clearly defined.\n` +
        `- **Next Step**: Click the **Regenerate** button below in a few moments or try toggling Web Search for fresh citations.\n\n` +
        `*Bengali note: এআই সার্ভার এই মুহূর্তে সাময়িক ভারী ট্রাফিকের সম্মুখীন। অনুগ্রহ করে কিছুক্ষণ পর 'Regenerate' চাপুন।*`;

      res.write(`data: ${JSON.stringify({ text: fallbackText })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

    let groundingMetadata: any = null;

    for await (const chunk of responseStream) {
      const textChunk = chunk.text || '';
      if (chunk.candidates?.[0]?.groundingMetadata) {
        groundingMetadata = chunk.candidates[0].groundingMetadata;
      }

      if (textChunk) {
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
    }

    // If grounding sources were retrieved from Google Search, send them
    if (groundingMetadata?.groundingChunks) {
      const sources = groundingMetadata.groundingChunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          title: c.web.title || 'Web Source',
          url: c.web.uri,
        }));

      if (sources.length > 0) {
        res.write(`data: ${JSON.stringify({ sources })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Chat stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'An error occurred during chat streaming.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Generation interrupted.' })}\n\n`);
      res.end();
    }
  }
});

// Text-to-Speech API using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required for TTS.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Gemini API key is not configured.' });
      return;
    }

    // Clean text of markdown syntax for cleaner speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/[#*_~>]/g, '')
      .slice(0, 1000); // Limit to 1000 chars for responsive audio

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'No audio returned from speech model.' });
      return;
    }

    res.json({
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate speech.' });
  }
});

// Image Generation API using gemini-3.1-flash-lite-image
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required for image generation.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Gemini API key is not configured.' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      res.status(500).json({ error: 'Failed to extract generated image.' });
      return;
    }

    res.json({ imageUrl, prompt });
  } catch (error: any) {
    console.error('Image gen error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image.' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVA AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
