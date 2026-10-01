'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Hash, Send, Paperclip, FileText, X, Menu, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  message: string;
  attachment_url?: string;
  attachment_name?: string;
  created_at: string;
  sender?: {
    full_name: string;
    role: string;
  };
}

export default function SlackWorkspaceChat({
  currentUser,
}: {
  currentUser: { id: string; full_name: string; role: string };
}) {
  const [channels] = useState([
    { id: 'general', name: 'general', desc: 'Company-wide updates' },
    { id: 'milestones-qa', name: 'milestones-qa', desc: 'Deliverables & QA reviews' },
    { id: 'internal-devs', name: 'internal-devs', desc: 'Dev tasks & sync' },
  ]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async (channelId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('channel_messages')
      .select(`
        id,
        channel_id,
        sender_id,
        message,
        attachment_url,
        attachment_name,
        created_at,
        sender:profiles(full_name, role)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      setMessages(data as any);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages(activeChannel);

    const channelSubscription = supabase
      .channel(`slack_${activeChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${activeChannel}`,
        },
        async (payload) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single();

          const incomingMsg: Message = {
            id: payload.new.id,
            channel_id: payload.new.channel_id,
            sender_id: payload.new.sender_id,
            message: payload.new.message,
            attachment_url: payload.new.attachment_url,
            attachment_name: payload.new.attachment_name,
            created_at: payload.new.created_at,
            sender: senderData || { full_name: 'Member', role: 'team' },
          };

          setMessages((prev) => [...prev, incomingMsg]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [activeChannel, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    setUploading(true);
    let uploadedUrl = '';
    let uploadedFileName = '';

    try {
      if (selectedFile) {
        uploadedFileName = selectedFile.name;
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `slack/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project_files')
          .upload(filePath, selectedFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('project_files')
            .getPublicUrl(filePath);
          uploadedUrl = publicUrl;
        }
      }

      const payload: any = {
        channel_id: String(activeChannel),
        sender_id: currentUser.id,
        message: newMessage.trim() || (uploadedFileName ? `Attached: ${uploadedFileName}` : ''),
      };

      if (uploadedUrl) {
        payload.attachment_url = uploadedUrl;
        payload.attachment_name = uploadedFileName;
      }

      const { error } = await supabase.from('channel_messages').insert([payload]);

      if (error) {
        alert('Send error: ' + error.message);
      } else {
        setNewMessage('');
        setSelectedFile(null);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const isImageFile = (url: string = '') => {
    return /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs flex flex-col md:flex-row h-[520px] sm:h-[600px] relative">
      {/* Sidebar: Mobile overlay & Desktop side */}
      <div className={`
        absolute inset-0 z-30 md:static md:z-auto w-full md:w-56 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C8FF91] inline-block" />
              Slack Room
            </h3>
            <p className="text-[10px] text-slate-400">Live Team Connect</p>
          </div>
          <button 
            type="button" 
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
            Channels
          </span>
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                setActiveChannel(ch.id);
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeChannel === ch.id
                  ? 'bg-slate-800 text-[#C8FF91] font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Hash size={13} className={activeChannel === ch.id ? 'text-[#C8FF91]' : 'text-slate-500'} />
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <div className="truncate">
            <p className="font-bold text-white text-[11px] truncate">{currentUser.full_name}</p>
            <span className="text-[9px] font-mono text-emerald-400 uppercase">{currentUser.role}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Header */}
        <div className="px-3 sm:px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
              title="Channels"
            >
              <Menu size={16} />
            </button>
            <Hash size={15} className="text-slate-500 shrink-0" />
            <h4 className="font-bold text-xs text-slate-900 uppercase truncate">
              {activeChannel}
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline truncate max-w-[200px]">
            {channels.find((c) => c.id === activeChannel)?.desc}
          </span>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-16 text-xs text-slate-400 font-mono">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400">
              No messages in #{activeChannel} yet. Say hi!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0 uppercase">
                  {msg.sender?.full_name?.slice(0, 1) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 truncate">{msg.sender?.full_name || 'Member'}</span>
                    <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                      {msg.sender?.role || 'team'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono ml-auto">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.message && (
                    <p className="text-slate-700 mt-0.5 leading-relaxed break-words">{msg.message}</p>
                  )}
                  {msg.attachment_url && (
                    <div className="mt-1.5">
                      {isImageFile(msg.attachment_url) ? (
                        <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="block max-w-[200px] rounded-lg overflow-hidden border border-slate-200">
                          <img src={msg.attachment_url} alt="file" className="max-h-36 w-auto object-cover" />
                        </a>
                      ) : (
                        <a
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-800"
                        >
                          <FileText size={13} />
                          <span className="truncate max-w-[140px]">{msg.attachment_name || 'File'}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected file preview */}
        {selectedFile && (
          <div className="px-3 py-1 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="truncate text-slate-700 text-[11px]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-slate-700">
              <X size={13} />
            </button>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-2 sm:p-2.5 border-t border-slate-200 flex items-center gap-1.5 bg-white">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 shrink-0"
            title="Attach file"
          >
            <Paperclip size={15} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${activeChannel}...`}
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-800 min-w-0"
          />
          <button
            type="submit"
            disabled={uploading}
            className="p-2 sm:px-3 sm:py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 disabled:opacity-50"
          >
            <Send size={13} />
            <span className="hidden sm:inline">{uploading ? '...' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}