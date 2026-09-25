'use client'
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: number;
  project_id: number;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

export default function ProjectTeamChat({ projectId, currentUserId }: { projectId: number | string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [senderInfo, setSenderInfo] = useState<{ name: string; role: string }>({ name: 'Member', role: 'member' });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.from('profiles').select('full_name, role').eq('id', currentUserId).single();
      if (data) setSenderInfo({ name: data.full_name || 'Member', role: data.role || 'member' });
    };
    if (currentUserId) fetchUser();
  }, [currentUserId]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('project_team_messages')
      .select('*')
      .eq('project_id', Number(projectId))
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`project_chat_${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_team_messages', filter: `project_id=eq.${projectId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);

    const { error } = await supabase.from('project_team_messages').insert([
      {
        project_id: Number(projectId),
        sender_id: currentUserId,
        sender_name: senderInfo.name,
        sender_role: senderInfo.role,
        message: text.trim(),
      },
    ]);

    if (!error) {
      setText('');
    }
    setSending(false);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col h-[320px] font-sans">
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-bold text-xs">#</span>
          <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">Connect Channel</span>
          <span className="text-[10px] text-slate-400 font-mono">Live</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
          {messages.length} updates
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic">
            <span>💬 No discussions in this channel yet.</span>
            <span className="text-[10px] text-slate-400">Coordinate tasks, blockers & milestones here.</span>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400 font-mono">
                  <span className="font-bold text-slate-700">{m.sender_name}</span>
                  <span>({m.sender_role})</span>
                  <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs shadow-2xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
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

      <form onSubmit={handleSend} className="p-2 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message project channel..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}