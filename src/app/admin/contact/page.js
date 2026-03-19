"use client";

import { useEffect, useState } from "react";
import { Mail, Trash2, CheckCircle, Clock, Search, Eye } from "lucide-react";

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/contact")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubmissions(data);
        } else {
          setSubmissions([]);
          console.error("Invalid data format:", data);
        }
      })
      .catch(err => console.error("Load failed:", err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const handleToggleRead = async (id, currentRead) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentRead }),
      });
      if (res.ok) {
        setSubmissions(submissions.map(s => s.id === id ? { ...s, isRead: !currentRead } : s));
        if (selected?.id === id) setSelected({ ...selected, isRead: !currentRead });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this submission?")) return;
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubmissions(submissions.filter(s => s.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = submissions.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inquiries & Support</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage messages from the Contact Us form
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by name, email, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/50 bg-card px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto divide-y divide-border/40">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No submissions found.</div>
              ) : (
                filtered.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelected(s); if(!s.isRead) handleToggleRead(s.id, false); }}
                    className={`w-full text-left p-4 transition-colors hover:bg-muted/30 ${selected?.id === s.id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-sm ${!s.isRead ? 'text-primary' : 'text-foreground'}`}>
                        {s.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mb-2">{s.subject}</div>
                    <div className="flex items-center gap-2">
                       {!s.isRead ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                          <Clock className="h-2.5 w-2.5" /> New
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <CheckCircle className="h-2.5 w-2.5" /> Read
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-7">
          {selected ? (
            <div className="rounded-xl border border-border/50 bg-card h-full flex flex-col shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/50 bg-muted/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {selected.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{selected.name}</h2>
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {selected.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRead(selected.id, selected.isRead)}
                      className={`h-11 px-5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        selected.isRead 
                          ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                          : 'bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10'
                      }`}
                    >
                      {selected.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      disabled={deleteId === selected.id}
                      className="h-11 px-5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Subject</div>
                  <div className="text-lg font-bold">{selected.subject}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Message</div>
                  <div className="bg-muted/30 rounded-lg p-5 text-foreground leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/10 border-t border-border/50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <span>Message Receipt</span>
                <span>{new Date(selected.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground bg-muted/5">
              <Eye className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
