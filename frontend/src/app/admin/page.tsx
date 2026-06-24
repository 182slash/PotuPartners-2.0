// frontend/src/app/admin/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, FileText, MessageSquare,
  LogOut, Upload, Trash2, CheckCircle, Clock, Plus, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminService, authService } from '@/services/api';
import type { User, RagDocument } from '@/types';
import { formatRelativeTime, formatFileSize, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type AdminTab = 'dashboard' | 'documents' | 'users' | 'chats';

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const setUser        = useAuthStore(s => s.setUser);
  const setAccessToken = useAuthStore(s => s.setAccessToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      if (data.data.user.role !== 'admin') {
        toast.error('Admin access required');
        return;
      }
      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      onSuccess();
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center">
            <span className="font-serif text-2xl font-light tracking-[0.3em] text-text-primary">POTU</span>
            <span className="font-serif text-[0.55rem] tracking-[0.5em] text-gold">PARTNERS</span>
          </div>
          <div className="gold-rule mt-4 mb-6" />
          <h1 className="font-sans text-sm tracking-[0.2em] uppercase text-text-muted">Admin Portal</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-gold"
              placeholder="admin@potupartners.site"
              required
            />
          </div>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-gold"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn('btn-gold btn-gold-fill w-full justify-center mt-2', loading && 'opacity-60')}
          >
            <span>{loading ? 'Signing in…' : 'Access Admin Panel'}</span>
          </button>
        </form>
        <p className="font-sans text-xs text-text-muted text-center mt-6">
          <a href="/" className="hover:text-gold transition-colors">← Back to website</a>
        </p>
      </div>
    </div>
  );
}

// ─── RAG Documents Tab ────────────────────────────────────────────────────────
function DocumentsTab() {
  const [docs,        setDocs]        = useState<RagDocument[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [file,        setFile]        = useState<File | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await adminService.listDocs();
      setDocs(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true);
    setProgress(0);
    try {
      await adminService.uploadDoc(file, title, description, pct => setProgress(pct));
      toast.success('Document uploaded and queued for indexing');
      setShowForm(false);
      setTitle(''); setDescription(''); setFile(null);
      load();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteDoc(id);
      setDocs(docs.filter(d => d.id !== id));
      toast.success('Document removed');
    } catch {
      toast.error('Could not delete document');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-light text-text-primary">RAG Knowledge Base</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold text-xs flex items-center gap-2">
          {showForm ? <><X size={12} /><span>Cancel</span></> : <><Plus size={12} /><span>Upload Document</span></>}
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <form onSubmit={handleUpload} className="border border-divider bg-surface-2 p-6 mb-6 space-y-4">
          <h3 className="font-sans text-sm text-text-secondary mb-2">Add Knowledge Document</h3>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
              Document Title
            </label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="input-gold" placeholder="e.g. Company Profile 2024" required />
          </div>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
              Description (optional)
            </label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="input-gold" placeholder="Brief description of document contents" />
          </div>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
              File (PDF or DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="input-gold file:mr-3 file:py-1 file:px-3 file:border file:border-gold-faint file:bg-transparent file:text-gold file:text-xs file:cursor-pointer"
              required
            />
          </div>
          {uploading && (
            <div className="space-y-1">
              <div className="h-0.5 bg-surface-3">
                <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[0.6rem] text-text-muted font-sans">Uploading & indexing… {progress}%</p>
            </div>
          )}
          <button type="submit" disabled={uploading || !file || !title}
            className={cn('btn-gold btn-gold-fill text-xs', uploading && 'opacity-60')}>
            <span>{uploading ? 'Processing…' : 'Upload & Index'}</span>
          </button>
        </form>
      )}

      {/* Documents list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="border border-dashed border-divider p-10 text-center">
          <FileText size={24} className="text-text-muted mx-auto mb-3 opacity-50" />
          <p className="font-sans text-sm text-text-muted">No documents uploaded yet.</p>
          <p className="font-sans text-xs text-text-muted mt-1">Upload PDF or DOCX files to power the AI assistant.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-4 p-4 border border-divider bg-surface-2 hover:border-gold-faint transition-colors group">
              <div className="p-2 border border-divider flex-shrink-0">
                <FileText size={14} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-text-primary font-light truncate">{doc.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {doc.fileSizeBytes && (
                    <span className="text-[0.6rem] text-text-muted font-sans">{formatFileSize(doc.fileSizeBytes)}</span>
                  )}
                  <span className="text-[0.6rem] text-text-muted font-sans">{formatRelativeTime(doc.createdAt)}</span>
                  {doc.chunkCount && (
                    <span className="text-[0.6rem] text-text-muted font-sans">{doc.chunkCount} chunks</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.indexed ? (
                  <span className="flex items-center gap-1 text-[0.6rem] text-emerald-400 font-sans">
                    <CheckCircle size={10} />Indexed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[0.6rem] text-gold font-sans">
                    <Clock size={10} />Indexing
                  </span>
                )}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users,    setUsers]    = useState<User[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ email: '', password: '', fullName: '', role: 'associate', title: '' });
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await adminService.listUsers();
      setUsers(data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.createUser(form);
      toast.success('User created');
      setShowForm(false);
      setForm({ email: '', password: '', fullName: '', role: 'associate', title: '' });
      load();
    } catch {
      toast.error('Could not create user');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deactivated');
    } catch {
      toast.error('Could not deactivate user');
    }
  };

  const ROLE_COLORS: Record<string, string> = {
    admin:     'text-purple-400 border-purple-400/30',
    partner:   'text-gold border-gold/30',
    associate: 'text-sky-400 border-sky-400/30',
    client:    'text-text-muted border-divider',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-light text-text-primary">Manage Users</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold text-xs flex items-center gap-2">
          {showForm ? <><X size={12}/><span>Cancel</span></> : <><Plus size={12}/><span>Add Staff Member</span></>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-divider bg-surface-2 p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h3 className="font-sans text-sm text-text-secondary md:col-span-2 mb-0">New Staff Member</h3>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">Full Name</label>
            <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
              className="input-gold" required />
          </div>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="input-gold" required />
          </div>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="input-gold" required />
          </div>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="input-gold bg-surface-2">
              <option value="associate">Associate</option>
              <option value="partner">Managing Partner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">Title</label>
            <input type="text" value={form.title} placeholder="e.g. Senior Associate"
              onChange={e => setForm({...form, title: e.target.value})} className="input-gold" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={saving}
              className={cn('btn-gold btn-gold-fill text-xs', saving && 'opacity-60')}>
              <span>{saving ? 'Creating…' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14" />)}</div>
      ) : (
        <div className="border border-divider overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-divider bg-surface-3">
                <th className="text-left px-4 py-3 text-[0.6rem] tracking-[0.15em] uppercase text-text-muted font-sans font-normal">Name</th>
                <th className="text-left px-4 py-3 text-[0.6rem] tracking-[0.15em] uppercase text-text-muted font-sans font-normal hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-[0.6rem] tracking-[0.15em] uppercase text-text-muted font-sans font-normal">Role</th>
                <th className="text-left px-4 py-3 text-[0.6rem] tracking-[0.15em] uppercase text-text-muted font-sans font-normal hidden lg:table-cell">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-divider hover:bg-surface-3 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="font-sans text-sm text-text-primary font-light">{u.fullName}</p>
                    {u.title && <p className="font-sans text-xs text-text-muted">{u.title}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-sans text-xs text-text-secondary">{u.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('badge-gold text-[0.55rem]', ROLE_COLORS[u.role] ?? '')}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn('text-xs font-sans', u.isOnline ? 'text-emerald-400' : 'text-text-muted')}>
                      {u.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────
function DashboardTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-light text-text-primary">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users',       value: '—', sub: 'Clients + Staff' },
          { label: 'Active Conversations', value: '—', sub: 'Last 24 hours' },
          { label: 'Documents Indexed', value: '—', sub: 'In RAG knowledge base' },
        ].map(s => (
          <div key={s.label} className="border border-divider bg-surface-2 p-6">
            <p className="font-serif text-3xl font-light text-gold mb-1">{s.value}</p>
            <p className="font-sans text-xs text-text-primary">{s.label}</p>
            <p className="font-sans text-xs text-text-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="border border-divider bg-surface-2 p-6">
        <p className="font-sans text-sm text-text-secondary font-light leading-relaxed">
          Welcome to the PotuPartners Admin Panel. Use the navigation to manage knowledge base documents,
          staff accounts, and monitor client conversations. All actions are logged for audit purposes.
        </p>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const user        = useAuthStore(s => s.user);
  const clearAuth   = useAuthStore(s => s.clearAuth);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    if (user?.role === 'admin') setAuthenticated(true);
  }, [user]);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  const NAV_ITEMS: { tab: AdminTab; icon: React.ElementType; label: string }[] = [
    { tab: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { tab: 'documents',  icon: FileText,        label: 'Knowledge Base' },
    { tab: 'users',      icon: Users,           label: 'Users' },
    { tab: 'chats',      icon: MessageSquare,   label: 'Chat Monitor' },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="border-b border-divider bg-surface px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <span className="font-serif text-sm font-light tracking-widest text-text-primary" style={{ letterSpacing: '0.2em' }}>
            POTU
          </span>
          <span className="font-sans text-[0.55rem] tracking-[0.3em] text-gold ml-2 uppercase">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs text-text-muted hidden md:block">
            {user?.fullName}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-text-muted hover:text-gold transition-colors text-xs font-sans"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <nav className="w-14 md:w-48 border-r border-divider bg-surface flex-shrink-0 flex flex-col pt-4">
          {NAV_ITEMS.map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={cn(
                'admin-nav-item flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:text-gold',
                activeTab === item.tab ? 'active' : 'text-text-secondary border-l-2 border-transparent'
              )}
            >
              <item.icon size={16} />
              <span className="font-sans text-xs tracking-wide hidden md:block">{item.label}</span>
            </button>
          ))}
          <div className="mt-auto p-4">
            <a href="/" className="font-sans text-[0.65rem] text-text-muted hover:text-gold transition-colors hidden md:block">
              ← Website
            </a>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'users'     && <UsersTab />}

          {activeTab === 'chats' && (
            <div className="text-center py-20">
              <MessageSquare size={32} className="text-text-muted mx-auto mb-4 opacity-30" />
              <p className="font-serif text-lg font-light text-text-muted">Chat monitor coming in Phase 3</p>
              <p className="font-sans text-xs text-text-muted mt-2">Real-time oversight will be available once the backend is connected.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}