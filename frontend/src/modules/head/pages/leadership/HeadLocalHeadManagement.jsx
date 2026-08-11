import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Shield, Users, Plus, Edit, Trash2, Loader, CheckCircle2, 
  XCircle, Lock, Mail, Phone, MapPin, User, Settings, RefreshCw, Key, Copy, Check, Eye, EyeOff, Share2, Sparkles
} from 'lucide-react';
import headLeadershipService from '../../../../core/api/headLeadershipService';
import { useData } from '../../../member/context/DataProvider';

export default function HeadLocalHeadManagement() {
  const { user } = useData();
  const [subLeaders, setSubLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    designation: 'Local Head',
    department: 'Local Governance',
    city: user?.city || '',
    termYears: '2024-2027',
    headPermissions: {
      canViewDashboard: true,
      canViewMembers: true,
      canViewEvents: true,
      canCreateEvents: true,
      canViewDonations: true,
      canCreateDonationCampaigns: false,
      canViewFunds: true,
      canViewLeadership: true,
      canViewDharmashala: true,
      canViewSocial: true,
      canViewInvitations: true,
      canSendNotifications: false
    }
  });

  const availableModules = [
    { key: 'canViewDashboard', label: 'Dashboard Access' },
    { key: 'canViewMembers', label: 'Members Directory' },
    { key: 'canViewEvents', label: 'Events Module' },
    { key: 'canCreateEvents', label: 'Create Events' },
    { key: 'canViewDonations', label: 'Donations Module' },
    { key: 'canCreateDonationCampaigns', label: 'Create Campaigns' },
    { key: 'canViewFunds', label: 'Community Funds' },
    { key: 'canViewLeadership', label: 'Leadership Access' },
    { key: 'canViewDharmashala', label: 'Dharmashala Booking' },
    { key: 'canViewSocial', label: 'Social Feed' },
    { key: 'canViewInvitations', label: 'Invitations' },
    { key: 'canSendNotifications', label: 'Send Notifications' }
  ];

  // Head's own permissions granted by Master Admin
  const headGrantedPermissions = user?.headPermissions || {};

  const fetchLocalHeads = async () => {
    setLoading(true);
    try {
      const res = await headLeadershipService.getSubLeaders();
      if (res.status === 'success') {
        setSubLeaders(res.data);
      }
    } catch (err) {
      console.error("Failed to load local heads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalHeads();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setForm({
      isAppUser: true,
      name: '',
      email: '',
      phone: '',
      password: '',
      designation: 'Local Head',
      department: 'Local Governance',
      city: user?.city || '',
      termYears: '2024-2027',
      headPermissions: {
        canViewDashboard: true,
        canViewMembers: true,
        canViewEvents: true,
        canViewDonations: true,
        canViewFunds: true,
        canViewLeadership: true,
        canViewDharmashala: true,
        canViewSocial: true
      }
    });
    setShowModal(true);
  };

  const openEditModal = (leader) => {
    setEditId(leader._id);
    setForm({
      isAppUser: true,
      name: leader.name || '',
      email: leader.email || '',
      phone: leader.phone || '',
      password: '',
      designation: leader.designation || 'Local Head',
      department: leader.department || 'Local Governance',
      city: leader.city || user?.city || '',
      termYears: leader.termYears || '2024-2027',
      headPermissions: leader.headPermissions || {
        canViewDashboard: true,
        canViewMembers: true
      }
    });
    setShowModal(true);
  };

  const handleTogglePermission = (permKey) => {
    const isGrantedToHead = user?.role === 'admin' || headGrantedPermissions[permKey] === true;
    if (!isGrantedToHead) {
      alert(`Permission '${permKey}' is not granted to you by Master Admin.`);
      return;
    }

    setForm(prev => ({
      ...prev,
      headPermissions: {
        ...prev.headPermissions,
        [permKey]: !prev.headPermissions[permKey]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !form.password) {
      alert("Please enter a password for the Local Head login account.");
      return;
    }

    try {
      let res;
      if (editId) {
        res = await headLeadershipService.updateSubLeader(editId, form);
      } else {
        res = await headLeadershipService.createSubLeader(form);
      }

      if (res.status === 'success') {
        setShowModal(false);
        fetchLocalHeads();

        if (!editId) {
          // Trigger success credentials modal
          setCreatedCredentials({
            name: form.name,
            email: form.email || form.phone,
            phone: form.phone,
            password: form.password,
            designation: form.designation,
            city: form.city || user?.city || 'Local Unit'
          });
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save Local Head");
    }
  };

  const handleToggleStatus = async (leader) => {
    try {
      const res = await headLeadershipService.toggleSubLeaderStatus(leader._id, true);
      if (res.status === 'success') {
        fetchLocalHeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (leader) => {
    if (!window.confirm(`Are you sure you want to remove Local Head '${leader.name}'?`)) return;
    try {
      const res = await headLeadershipService.deleteSubLeader(leader._id, true);
      if (res.status === 'success') {
        fetchLocalHeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyLoginDetails = (credentials) => {
    const loginText = `🚩 *MeriSamaj - Local Head Appointment Credentials*

Dear *${credentials.name}*,
You have been appointed as *${credentials.designation}* (${credentials.city}) in MeriSamaj!

🔑 *Your Login Credentials:*
• Login Portal: ${window.location.origin}/login
• Username / Email: ${credentials.email}
• Password: ${credentials.password}

Please log in using these credentials to access your Local Head Management Desk.`;

    navigator.clipboard.writeText(loginText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-indigo-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-2xl shrink-0 shadow-inner">
            <ShieldCheck size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-300 mb-1">
              <Sparkles size={14} className="text-amber-400" /> Community Head Governance
            </div>
            <h1 className="text-2xl font-black text-white leading-tight">Local Head Management</h1>
            <p className="text-xs font-semibold text-indigo-200/80 mt-0.5">
              Create and delegate Local Heads with custom email & password credentials.
            </p>
          </div>
        </div>

        <button 
          onClick={openCreateModal}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} /> Create Local Head
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{subLeaders.length}</div>
            <div className="text-xs font-semibold text-slate-500">Total Local Leaders</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Key size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">
              {subLeaders.filter(l => l.accountStatus === 'active').length}
            </div>
            <div className="text-xs font-semibold text-slate-500">Active Login Accounts</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">
              {new Set(subLeaders.map(l => l.city).filter(Boolean)).size || 1}
            </div>
            <div className="text-xs font-semibold text-slate-500">Assigned Cities / Units</div>
          </div>
        </div>
      </div>

      {/* Local Heads Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Local Heads Directory</h3>
            <p className="text-xs text-slate-500 font-medium">Local Heads can log in to the Head Desk with assigned permissions.</p>
          </div>
          <button onClick={fetchLocalHeads} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader className="animate-spin" size={20} /> Loading Local Heads...
          </div>
        ) : subLeaders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Shield size={40} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold">No Local Heads created yet.</p>
            <button 
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700"
            >
              + Create First Local Head
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Local Head</th>
                  <th className="pb-3 px-3">Login Identifiers</th>
                  <th className="pb-3 px-3">Jurisdiction / City</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {subLeaders.map((leader) => (
                  <tr key={leader._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {leader.name?.[0]?.toUpperCase() || 'L'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{leader.name}</div>
                          <div className="text-[11px] font-semibold text-indigo-600">{leader.designation || 'Local Head'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <Mail size={13} className="text-slate-400" /> {leader.email || leader.loginId || 'N/A'}
                      </div>
                      {leader.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone size={12} className="text-slate-400" /> {leader.phone}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg">
                        <MapPin size={12} /> {leader.city || user?.city || 'Local Unit'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <button 
                        onClick={() => handleToggleStatus(leader)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                          leader.accountStatus === 'active' 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        {leader.accountStatus === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {leader.accountStatus === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(leader)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Permissions & Details"
                        >
                          <Edit size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(leader)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Local Head"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Local Head Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editId ? 'Edit Local Head & Permissions' : 'Create New Local Head'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Set login email & password for the Local Head to log in to the portal.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Ramesh Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Login Email Address *</label>
                  <input 
                    type="email" required
                    placeholder="localhead.jaipur@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {editId ? 'New Login Password (Optional)' : 'Set Login Password *'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required={!editId}
                      placeholder={editId ? 'Leave blank to keep current' : 'Set secure password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
                  <input 
                    type="text"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Designation Title *</label>
                  <select 
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="Local Head">Local Head (स्थानीय अध्यक्ष)</option>
                    <option value="Vice President">Vice President (उपाध्यक्ष)</option>
                    <option value="Secretary">Secretary (सचिव)</option>
                    <option value="Treasurer">Treasurer (कोषाध्यक्ष)</option>
                    <option value="City Coordinator">City Coordinator (नगर संयोजक)</option>
                    <option value="Committee Member">Committee Member (समिति सदस्य)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / Region Jurisdiction</label>
                  <input 
                    type="text"
                    placeholder="e.g. Jaipur, Indore"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Module Permission Access Checklist */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={13} className="text-indigo-600" /> Module Access Permissions
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Grant or restrict access for this Local Head
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {availableModules.map((mod) => {
                    const isGrantedToHead = user?.role === 'admin' || headGrantedPermissions[mod.key] === true;
                    const isChecked = form.headPermissions[mod.key] === true;

                    return (
                      <label 
                        key={mod.key}
                        onClick={() => handleTogglePermission(mod.key)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : isGrantedToHead 
                              ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span>{mod.label}</span>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          disabled={!isGrantedToHead}
                          onChange={() => {}}
                          className="hidden"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  {editId ? 'Update Local Head' : 'Create & Save Local Head'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Credentials Success Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-emerald-100 animate-in fade-in zoom-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">Local Head Created!</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Share these login credentials with <strong className="text-slate-800">{createdCredentials.name}</strong> so they can log in.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs font-mono border border-slate-800 relative">
              <div className="text-[11px] text-slate-400 font-sans font-bold uppercase tracking-wider border-b border-slate-800 pb-1 mb-2 flex justify-between items-center">
                <span>Login Credentials Card</span>
                <span className="text-emerald-400 font-extrabold">{createdCredentials.city}</span>
              </div>
              <div><span className="text-slate-400">Portal:</span> {window.location.origin}/login</div>
              <div><span className="text-slate-400">Email:</span> <span className="text-amber-300 font-bold">{createdCredentials.email}</span></div>
              <div><span className="text-slate-400">Password:</span> <span className="text-emerald-300 font-bold">{createdCredentials.password}</span></div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => copyLoginDetails(createdCredentials)}
                className={`flex-1 py-3 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Credentials Copied!' : 'Copy Login Details'}
              </button>

              <button 
                onClick={() => setCreatedCredentials(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
