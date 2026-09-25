'use client'
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ProjectConnectChatProps {
  projectId: number;
  projectTitle: string;
  currentUserId: string;
  currentUserRole?: string;
}

export default function ProjectConnectChat({
  projectId,
  projectTitle,
  currentUserId,
  currentUserRole = 'team',
}: ProjectConnectChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const channelSlug = `#${(projectTitle || 'general').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('project_feedbacks')
      .select('*, sender:profiles(full_name, role)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat_proj_${projectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'project_feedbacks', filter: `project_id=eq.${projectId}` },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    const { error } = await supabase.from('project_feedbacks').insert([
      {
        project_id: projectId,
        client_id: currentUserId,
        message: text.trim(),
      },
    ]);

    setSending(false);
    if (!error) {
      setText('');
      fetchMessages();
    } else {
      alert('Error sending message: ' + error.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl flex flex-col h-[480px] shadow-xs overflow-hidden font-sans">
      {/* Channel Header (Slack style) */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-mono font-bold text-xs text-slate-800 tracking-tight">
            {channelSlug}
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Project Channel</span>
        </div>
        <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-mono">
          {messages.length} messages
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <span className="text-2xl mb-1">💬</span>
            <p className="text-xs font-semibold text-slate-600">No discussions started yet.</p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
              Discuss sprints, blockers, and deliverables directly inside {channelSlug}.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.client_id === currentUserId;
            const senderName = m.sender?.full_name || 'Team Member';
            const senderRole = m.sender?.role || currentUserRole;

            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-bold text-slate-700">{senderName}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                    {senderRole}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl max-w-sm text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${channelSlug}... Use @ to mention or share updates`}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-40"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}