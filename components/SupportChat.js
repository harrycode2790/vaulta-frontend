'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { messagesApi } from '@/lib/api';
import styles from './SupportChat.module.css';

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtDay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return 'Today';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SupportChat() {
  const [open,       setOpen]       = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [convId,     setConvId]     = useState(null);
  const [text,       setText]       = useState('');
  const [sending,    setSending]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [unread,     setUnread]     = useState(0);
  const [error,      setError]      = useState('');
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const pollRef    = useRef(null);
  const lastMsgId  = useRef(null);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await messagesApi.getAll();
      const conv = res.data;
      if (conv) {
        setConvId(conv.id);
        const msgs = conv.messages ?? [];
        setMessages(msgs);

        // track unread admin replies when chat is closed
        if (!open && msgs.length > 0) {
          const lastId = msgs[msgs.length - 1]?.id;
          if (lastId !== lastMsgId.current) {
            const newSupport = msgs.filter(
              (m) => m.senderType === 'ADMIN' && m.id !== lastMsgId.current
            );
            if (lastMsgId.current !== null && newSupport.length > 0) {
              setUnread((u) => u + newSupport.length);
            }
            lastMsgId.current = lastId;
          }
        }
      }
    } catch {
      // silent fail for polling
    } finally {
      if (!silent) setLoading(false);
    }
  }, [open]);

  // Initial load when chat opens
  useEffect(() => {
    if (open) {
      setUnread(0);
      fetchMessages(false);
      inputRef.current?.focus();
    }
  }, [open, fetchMessages]);

  // Poll every 4 s while open
  useEffect(() => {
    if (!open) {
      clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => fetchMessages(true), 4000);
    return () => clearInterval(pollRef.current);
  }, [open, fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError('');
    setSending(true);
    const optimistic = {
      id: `opt-${Date.now()}`,
      senderType: 'USER',
      message: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');
    try {
      await messagesApi.send({ message: trimmed });
      await fetchMessages(true);
    } catch (err) {
      setError(err.message || 'Failed to send. Try again.');
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  // Group messages by day
  function groupByDay(msgs) {
    const groups = [];
    let lastDay = null;
    msgs.forEach((m) => {
      const day = fmtDay(m.createdAt);
      if (day !== lastDay) {
        groups.push({ type: 'divider', day });
        lastDay = day;
      }
      groups.push({ type: 'msg', ...m });
    });
    return groups;
  }

  const grouped = groupByDay(messages);

  return (
    <>
      {/* ── Chat panel ── */}
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`} role="dialog" aria-label="Support Chat" aria-hidden={!open}>

        {/* Panel header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.supportAvatar}>V</div>
            <div className={styles.headerMeta}>
              <span className={styles.headerName}>Vaulta Support</span>
              <span className={styles.headerStatus}>
                <span className={styles.onlineDot} />
                Online · typically replies in minutes
              </span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div className={styles.messages}>
          {loading && messages.length === 0 && (
            <div className={styles.loadingWrap}>
              <span className={styles.loadingDots}><span/><span/><span/></span>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className={styles.emptyChat}>
              <div className={styles.emptyChatIcon}>💬</div>
              <p className={styles.emptyChatText}>Send us a message — we&apos;re here to help with your Vaulta account.</p>
            </div>
          )}

          {grouped.map((item, i) =>
            item.type === 'divider' ? (
              <div key={`div-${i}`} className={styles.dayDivider}>
                <span>{item.day}</span>
              </div>
            ) : (
              <div
                key={item.id}
                className={`${styles.msgRow} ${item.senderType === 'USER' ? styles.msgRowUser : styles.msgRowSupport}`}
              >
                {item.senderType === 'ADMIN' && (
                  <div className={styles.msgAvatar}>V</div>
                )}
                <div className={`${styles.bubble} ${item.senderType === 'USER' ? styles.bubbleUser : styles.bubbleSupport}`} style={item.senderType === 'ADMIN' ? {} : {}}>
                  <p className={styles.bubbleText}>{item.message}</p>
                  <span className={styles.bubbleTime}>{fmtTime(item.createdAt)}</span>
                </div>
              </div>
            )
          )}

          {error && <div className={styles.errorNote}>{error}</div>}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <form className={styles.inputArea} onSubmit={handleSend}>
          <textarea
            ref={inputRef}
            className={styles.textInput}
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            maxLength={5000}
            disabled={sending}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!text.trim() || sending}
            aria-label="Send message"
          >
            {sending ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.spinIcon}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.23-3.7"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* ── Floating trigger button ── */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close support chat' : 'Open support chat'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!open && unread > 0 && (
          <span className={styles.unreadBadge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
    </>
  );
}
