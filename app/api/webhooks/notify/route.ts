import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, message, type } = await req.json();

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhookUrl) {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 *[Studio Alert: ${type || 'General'}]*\n*${title}*\n${message}`,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}