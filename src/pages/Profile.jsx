import { User, Mail, Calendar, Shield, LogOut, Save, Users, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export function Profile() {
    const { user, signOut, profiles, fetchProfiles } = useAuth()
    const [name, setName] = useState(user?.user_metadata?.full_name || '')
    const [newProfileName, setNewProfileName] = useState('')
    const [loading, setLoading] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: name }
            })
            if (error) throw error
            setMessage('Profile updated successfully! ✨')
        } catch (err) {
            setMessage('Failed to update profile. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    const handleAddProfile = async (e) => {
        e.preventDefault()
        if (!newProfileName.trim()) return
        setProfileLoading(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .insert([{ user_id: user.id, name: newProfileName, is_default: false }])

            if (error) throw error
            setNewProfileName('')
            fetchProfiles(user.id)
        } catch (err) {
            console.error(err)
        } finally {
            setProfileLoading(false)
        }
    }

    const handleDeleteProfile = async (id, isDefault) => {
        if (isDefault) return alert("Cannot delete your primary 'Default' book.")
        if (!confirm("Are you sure? All transactions in this book will be lost!")) return

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id)
            if (error) throw error
            fetchProfiles(user.id)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <User className="text-emerald-500 w-8 h-8" />
                    User Profile
                </h1>
                <p className="text-slate-400 mt-1">Manage your account settings and personal information.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                        <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-500 text-4xl font-bold mx-auto mb-4 border border-slate-700 shadow-inner group-hover:scale-105 transition-transform">
                            {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{user?.user_metadata?.full_name || 'User'}</h3>
                        <p className="text-slate-500 text-sm mb-6 truncate">{user?.email}</p>

                        <div className="text-left space-y-4 pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs">Joined {new Date(user?.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs">Security: Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-white mb-6">Personal Details</h2>

                        {message && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-slate-700 transition-all outline-none"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="email"
                                        disabled
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950/20 border border-slate-800/50 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                                        value={user?.email}
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center">
                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-700 uppercase tracking-widest font-bold">Locked</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-slate-600 italic">Email cannot be changed for security reasons.</p>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10"
                                >
                                    {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Manage Books Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="text-indigo-400 w-6 h-6" />
                            <h2 className="text-xl font-bold text-white">Manage Expense Books</h2>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">Create multiple "Books" to separate your personal, work, or family expenses under one email account.</p>

                        <form onSubmit={handleAddProfile} className="flex gap-2 mb-8">
                            <input
                                type="text"
                                placeholder="Book Name (e.g. Business)"
                                className="flex-1 px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white outline-none"
                                value={newProfileName}
                                onChange={(e) => setNewProfileName(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 rounded-xl transition-all flex items-center gap-2"
                            >
                                {profileLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Plus className="w-4 h-4" /> Add</>}
                            </button>
                        </form>

                        <div className="space-y-3">
                            {profiles.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-indigo-500/30 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${p.is_default ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                            {p.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{p.name}</p>
                                            {p.is_default && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">Primary</span>}
                                        </div>
                                    </div>
                                    {!p.is_default && (
                                        <button
                                            onClick={() => handleDeleteProfile(p.id, p.isDefault)}
                                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8">
                        <h2 className="text-xl font-bold text-rose-500 mb-2">Account Actions</h2>
                        <p className="text-slate-400 text-sm mb-6">These actions are permanent and cannot be undone.</p>

                        <button
                            onClick={() => signOut()}
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 border border-rose-500/20"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out from All Devices
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
