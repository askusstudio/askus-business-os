import { supabase } from '@/lib/supabase';

interface TriggerNotificationProps {
  userId: string;
  title: string;
  message: string;
  type?: 'task_assigned' | 'signoff_approved' | 'invoice_paid' | 'system';
  link?: string;
}

export async function triggerNotification({
  userId,
  title,
  message,
  type = 'system',
  link = '/dashboard/employee',
}: TriggerNotificationProps) {
  try {
    // 1. In-app database notification
    await supabase.from('workspace_notifications').insert([
      {
        user_id: userId,
        title,
        message,
        type,
        link,
        is_read: false,
      },
    ]);

    // 2. Optional external Slack/Discord Webhook (agar env me webhook configured ho)
    const webhookUrl = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 *${title}*\n${message}\nLink: ${link}`,
        }),
      }).catch((e) => console.log('Webhook push skipped:', e));
    }
  } catch (err) {
    console.error('Failed to trigger notification:', err);
  }
}