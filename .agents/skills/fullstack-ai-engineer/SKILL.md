---
name: fullstack-ai-engineer
description: Guia avançado e padrões de desenvolvimento para Engenharia Fullstack focada em Inteligência Artificial. Ative esta skill para projetos que envolvem Next.js, TypeScript, Python (FastAPI), Vercel AI SDK, RAG (Retrieval-Augmented Generation), bancos de dados vetoriais (PgVector/Pinecone), chamada de ferramentas (Function Calling) e integração com LLMs (OpenAI, Anthropic, Google Gemini, Ollama).
---

# Fullstack AI Engineer Skill Guide

Este guia estabelece os padrões arquiteturais, boas práticas e estrutura de código para o desenvolvimento de aplicações Fullstack impulsionadas por Inteligência Artificial.

---

## 1. Stack Tecnológica Recomendada

| Camada | Tecnologias Principais |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI, Lucide Icons |
| **Streaming & AI Hooks** | Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/anthropic`) |
| **Backend & APIs** | Next.js API Routes / Server Actions, Node.js (TypeScript) ou Python (FastAPI) |
| **Banco de Dados Relacional** | PostgreSQL (Supabase / Neon) com Prisma ORM ou Drizzle ORM |
| **Vector DB & RAG** | `pgvector` (PostgreSQL), Pinecone ou Qdrant |
| **Modelos & Orquestração** | LLMs via Vercel AI SDK, LangChain / LlamaIndex (quando necessário), Zod para esquemas |
| **Observabilidade & Custos** | LangSmith, Helicone ou Langfuse |

---

## 2. Padrões de Código & Arquitetura

### A. Validação de Saídas de IA com Zod (Structured Output)
Sempre utilize esquemas tipados para forçar respostas estruturadas das LLMs:

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const AnalysisSchema = z.object({
  summary: z.string().describe('Resumo executivo do texto'),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  keyPoints: z.array(z.string()).describe('Principais tópicos identificados'),
});

export async function analyzeText(prompt: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: AnalysisSchema,
    prompt,
  });
  return object;
}
```

### B. Streaming de Respostas no Frontend (Next.js + Vercel AI SDK)

#### Endpoint da API (`app/api/chat/route.ts`):
```typescript
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: google('gemini-1.5-pro'),
    system: 'Você é um assistente de IA especialista em engenharia de software.',
    messages,
  });
  return result.toDataStreamResponse();
}
```

#### Componente React (`app/chat/page.tsx`):
```tsx
'use client';
import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white self-end' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <p className="font-semibold text-xs opacity-75">{m.role === 'user' ? 'Você' : 'IA'}</p>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem..."
          className="flex-1 p-2 border rounded-md dark:bg-gray-900"
        />
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Enviar
        </button>
      </form>
    </div>
  );
}
```

---

## 3. Estrutura para RAG (Retrieval-Augmented Generation)

* **Chunking:** Divida documentos longos em pedaços (ex: 500-1000 tokens com 100 de overlap).
* **Embedding:** Gere vetores utilizando `text-embedding-3-small` (OpenAI) ou `text-embedding-004` (Google).
* **Armazenamento:** Salve no PostgreSQL com extensão `pgvector`.
* **Busca por Similaridade:** Utilize busca cosseno (`<=>`) para buscar os N chunks mais relevantes antes de enviar ao prompt da LLM.

---

## 4. Diretrizes de Segurança & Boas Práticas

1. **Chaves de API:** NUNCA exponha chaves (ex: `OPENAI_API_KEY`, `GEMINI_API_KEY`) no client-side (`NEXT_PUBLIC_`). Todas as chamadas de IA devem passar pelo backend.
2. **Tratamento de Rate Limit:** Implemente retry exponencial e fallbacks para rotas de IA.
3. **Sanitização de Prompts:** Proteja a aplicação contra Prompt Injection validando entradas de usuário.
4. **Design de UI/UX:** Sempre forneça feedback visual de carregamento (skeletons ou indicadores de digitação) enquanto a resposta está sendo gerada/transmitida via streaming.
