import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Trash2, Shield, Plus, X, Loader2 } from 'lucide-react';
import { listUsers, registerUser, deleteUser } from '../lib/api';
import { getUser } from '../lib/auth';

const AQ = '#40E0D0';
const RED = '#FF3366';
const MUTED = 'rgba(240,236,218,0.5)';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getUser();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'company',
    entity_id: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await listUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      await deleteUser(username);
      setUsers(users.filter((u) => u.username !== username));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (!payload.entity_id) delete payload.entity_id;
      
      const newUser = await registerUser(payload);
      setUsers([...users, newUser]);
      setShowAddForm(false);
      setFormData({ username: '', password: '', name: '', role: 'company', entity_id: '' });
    } catch (err) {
      alert(`Failed to create user: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase mb-2" style={{ color: AQ }}>
              System Administration
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: '#F0ECDA' }}>
              User Management
            </h1>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 border text-[11px] font-mono tracking-widest transition-colors hover:bg-white/10"
            style={{ borderColor: AQ, color: AQ }}
          >
            <Plus className="w-3.5 h-3.5" />
            ADD USER
          </motion.button>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm border font-mono" style={{ borderColor: RED, color: RED, background: 'rgba(255,51,102,0.1)' }}>
            Error: {error}
          </div>
        )}

        {/* Add User Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-6 relative border"
              style={{ background: 'rgba(14,30,47,0.9)', borderColor: 'rgba(72,127,134,0.3)', boxShadow: '0 0 60px rgba(72,127,134,0.1)' }}
            >
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl mb-6 font-bold" style={{ color: '#F0ECDA' }}>Register New User</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: MUTED }}>Username</label>
                  <input required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full bg-black/30 border px-3 py-2 text-sm text-white" style={{ borderColor: 'rgba(72,127,134,0.3)' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: MUTED }}>Password</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-black/30 border px-3 py-2 text-sm text-white" style={{ borderColor: 'rgba(72,127,134,0.3)' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: MUTED }}>Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/30 border px-3 py-2 text-sm text-white" style={{ borderColor: 'rgba(72,127,134,0.3)' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: MUTED }}>Role</label>
                  <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-black/30 border px-3 py-2 text-sm text-white" style={{ borderColor: 'rgba(72,127,134,0.3)' }}>
                    <option value="company">Company</option>
                    <option value="mentor">Mentor</option>
                    <option value="partner">Partner</option>
                    <option value="programme_admin">Programme Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: MUTED }}>Entity ID (Optional link to firestore entity)</label>
                  <input value={formData.entity_id} onChange={e => setFormData({ ...formData, entity_id: e.target.value })} className="w-full bg-black/30 border px-3 py-2 text-sm text-white" placeholder="e.g. mentor-john-doe" style={{ borderColor: 'rgba(72,127,134,0.3)' }} />
                </div>
                <div className="col-span-2 mt-4 flex justify-end">
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 border text-[11px] font-mono tracking-widest hover:bg-white/10" style={{ borderColor: AQ, color: AQ }}>
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                    CREATE USER
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        <div className="w-full overflow-x-auto border" style={{ borderColor: 'rgba(72,127,134,0.2)' }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ background: 'rgba(72,127,134,0.1)', color: MUTED }} className="text-[10px] font-mono tracking-widest uppercase">
                <th className="py-3 px-4 font-normal">Username</th>
                <th className="py-3 px-4 font-normal">Name</th>
                <th className="py-3 px-4 font-normal">Role</th>
                <th className="py-3 px-4 font-normal">Entity ID</th>
                <th className="py-3 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-white/50">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.username} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(72,127,134,0.1)' }}>
                    <td className="py-4 px-4 font-mono text-white/90">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#40E0D0]" />
                        {u.username}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/80">{u.name}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-mono border rounded" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[11px] font-mono text-white/40">{u.entity_id || '—'}</td>
                    <td className="py-4 px-4 text-right">
                      {u.username !== currentUser?.username && (
                        <button
                          onClick={() => handleDelete(u.username)}
                          className="p-1.5 border rounded hover:bg-[#FF3366]/10 transition-colors"
                          style={{ borderColor: 'rgba(255,51,102,0.3)', color: RED }}
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
