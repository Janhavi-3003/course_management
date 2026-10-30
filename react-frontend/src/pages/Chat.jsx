import { useEffect, useRef, useState } from 'react';
import * as api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useRealtime } from '../context/RealtimeContext.jsx';
import useAsync from '../hooks/useAsync.js';
import PageLayout from '../components/PageLayout.jsx';
import { Async, Empty } from '../components/Async.jsx';
import { errMsg } from '../utils/ui.js';

// Direct messages between users in real time (Socket.IO) with persisted history.
export default function Chat() {
  const { user, role } = useAuth();
  const { socket, connected, online, enabled } = useRealtime();
  const contacts = useAsync(() => api.getContacts(), []);
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [unreadFrom, setUnreadFrom] = useState({});
  const listRef = useRef(null);
  const peerRef = useRef(null);
  peerRef.current = peer;

  // load saved history whenever the conversation changes
  useEffect(() => {
    if (!peer) return undefined;
    let alive = true;
    setMessages([]);
    api.getMessages(peer.id).then((m) => { if (alive) setMessages(m); }).catch((e) => alive && setError(errMsg(e)));
    return () => { alive = false; };
  }, [peer?.id]); // eslint-disable-line

  // live messages
  useEffect(() => {
    if (!socket) return undefined;
    const onMsg = (m) => {
      const p = peerRef.current;
      const other = m.sender === user.id ? m.recipient : m.sender;
      if (p && other === p.id) {
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      } else if (m.sender !== user.id) {
        setUnreadFrom((u) => ({ ...u, [m.sender]: true }));
      }
    };
    socket.on('receive_message', onMsg);
    return () => socket.off('receive_message', onMsg);
  }, [socket, user.id]);

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages]);

  const choose = (c) => {
    setPeer(c); setError('');
    setUnreadFrom((u) => ({ ...u, [c.id]: false }));
  };

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !connected || !peer) return;
    setError('');
    socket.emit('send_message', { recipientId: peer.id, text }, (res) => {
      if (res?.success) setText('');
      else setError(res?.message || 'Message could not be sent');
    });
  };

  return (
    <PageLayout role={role}>
      <div className="section-head">
        <h1 style={{ fontSize: 22 }}>💬 Chat</h1>
        {enabled && <span className={`live${connected ? ' on' : ''}`} data-testid="conn-status"><i /> {connected ? 'Online' : 'Offline'}</span>}
      </div>
      {!enabled ? (
        <Empty icon="🔌" title="Live chat needs the Express backend">Mock mode has no WebSocket server. Run <code>npm run dev</code> to use real-time chat.</Empty>
      ) : (
        <div className="chat-layout">
          <div className="chat-side" data-testid="contacts">
            <Async state={contacts} loadingText="Loading contacts…">
              {(list) => (list.length === 0 ? <Empty icon="👥" title="No other users yet" /> : list.map((c) => (
                <button key={c.id} className={`chat-contact${peer?.id === c.id ? ' active' : ''}`} onClick={() => choose(c)} data-testid="contact">
                  <span className={`dot${online.includes(c.id) ? ' on' : ''}`} title={online.includes(c.id) ? 'Online' : 'Offline'} />
                  <span>{c.name}<br /><small style={{ color: 'var(--text-muted)' }}>{c.role}</small></span>
                  {unreadFrom[c.id] && <span className="unread" />}
                </button>
              )))}
            </Async>
          </div>
          <div className="chat-main">
            {!peer ? (
              <Empty icon="💬" title="Select someone to chat with">Messages are delivered instantly and saved.</Empty>
            ) : (
              <>
                <div className="chat-head">
                  <strong>{peer.name}</strong>
                  <span className={`live${online.includes(peer.id) ? ' on' : ''}`}><i /> {online.includes(peer.id) ? 'Online' : 'Offline'}</span>
                </div>
                <div className="chat-list" ref={listRef} data-testid="message-list">
                  {messages.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No messages yet — say hello!</p>}
                  {messages.map((m) => (
                    <div key={m.id} className={`bubble ${m.sender === user.id ? 'me' : 'them'}`} data-testid="bubble">
                      {m.text}
                      <small>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  ))}
                </div>
                {error && <div className="banner bad show" style={{ margin: '0 12px' }} role="alert">{error}</div>}
                <form className="chat-form" onSubmit={send}>
                  <input aria-label="Message" placeholder={connected ? 'Type a message' : 'Connecting…'} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} disabled={!connected} />
                  <button className="btn btn-primary" type="submit" disabled={!connected || !text.trim()}>Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
