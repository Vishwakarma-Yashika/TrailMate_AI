

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Please enter a nature question." },
        { status: 400 }
      );
    }

    if (question.length > 2000) {
      return NextResponse.json(
        { error: "Please keep your question under 2,000 characters." },
        { status: 400 }
      );
    }

    const ollamaResponse = await fetch(
      "http://127.0.0.1:11434/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi3:latest",
          stream: true,
          messages: [
            {
              role: "system",
              content:
                "You are TrailMate, a friendly outdoor and nature guide. " +
                "Give concise, practical advice about outdoor activities, " +
                "wildlife, plants, and hiking preparation. Prioritize safety. " +
                "Never invent live weather, current trail conditions, or verified locations."
            },
            { role: "user", content: question.trim() }
          ]
        })
      }
    );

    if (!ollamaResponse.ok || !ollamaResponse.body) {
      return NextResponse.json(
        { error: "Ollama could not generate a response." },
        { status: 502 }
      );
    }

    const reader = ollamaResponse.body.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { value, done } = await reader.read();
            buffer += decoder.decode(value, { stream: !done });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;

              const data = JSON.parse(line);

              if (data.message?.content) {
                controller.enqueue(
                  new TextEncoder().encode(data.message.content)
                );
              }

              if (data.error) {
                throw new Error(data.error);
              }
            }

            if (done) break;
          }

          if (buffer.trim()) {
            const data = JSON.parse(buffer);
            if (data.message?.content) {
              controller.enqueue(
                new TextEncoder().encode(data.message.content)
              );
            }
            if (data.error) throw new Error(data.error);
          }

          controller.close();
        } catch (error) {
          console.error("TrailMate stream error:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("TrailMate API error:", error);

    return NextResponse.json(
      { error: "Cannot connect to Ollama. Make sure it is running." },
      { status: 503 }
    );
  }
}
