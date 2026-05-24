import { NextResponse } from "next/server";

type RequestMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequestBody = {
  messages?: RequestMessage[];
};

function buildUpstreamErrorMessage(status: number) {
  switch (status) {
    case 401:
      return "DeepSeek 鉴权失败，请检查 DEEPSEEK_API_KEY 是否有效。";
    case 402:
      return "DeepSeek 账户额度不足，当前请求被拒绝。";
    case 429:
      return "DeepSeek 请求过于频繁，请稍后再试。";
    case 500:
    case 502:
    case 503:
    case 504:
      return "DeepSeek 服务暂时不可用，请稍后重试。";
    default:
      return `DeepSeek 请求失败，状态码 ${status}。`;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequestBody;
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "messages is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_API_BASE_URL ?? "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "未检测到 DEEPSEEK_API_KEY，请在 .env.local 中配置后再使用 AI 面板。",
        code: "missing_api_key",
      },
      { status: 503 },
    );
  }

  let upstream: Response;

  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are MyWorld's built-in assistant. Keep answers concise, practical, and readable inside a dashboard panel.",
          },
          ...messages,
        ],
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        error: "无法连接到 DeepSeek，请检查当前网络环境后重试。",
        code: "network_error",
      },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    let details = "";

    try {
      const errorPayload = (await upstream.json()) as {
        error?: {
          message?: string;
        };
      };
      details = errorPayload.error?.message ?? "";
    } catch {
      details = await upstream.text();
    }

    return NextResponse.json(
      {
        error: buildUpstreamErrorMessage(upstream.status),
        code: "upstream_error",
        details,
      },
      { status: 502 },
    );
  }

  const data = (await upstream.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const message = data.choices?.[0]?.message?.content?.trim();

  if (!message) {
    return NextResponse.json(
      {
        error: "DeepSeek 返回了空内容，请稍后重试。",
        code: "empty_response",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ message, model, provider: "deepseek" });
}
