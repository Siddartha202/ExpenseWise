import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, UserPlus, Lock, Mail, User } from 'lucide-react'

export function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password.length < 6) return setError('Password must be at least 6 characters')

        try {
            setError('')
            setLoading(true)
            const { data, error } = await signUp({
                email,
                password,
                options: {
                    data: { full_name: name }
                }
            })
            if (error) throw error
            // Redirect to dashboard immediately since email is auto-confirmed
            navigate('/')
        } catch (err) {
            setError(err.message || 'Failed to create an account.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="absolute inset-0 bg-emerald-500/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-slate-950 to-slate-950"></div>

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
                <div className="p-8 sm:p-12">
                    <div className="flex justify-center mb-8">
                        <div className="bg-emerald-500 rounded-2xl p-3 shadow-lg shadow-emerald-500/20">
                            <UserPlus className="w-8 h-8 text-slate-900" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
                    <p className="text-slate-400 text-center mb-8">Start tracking your finances today</p>

                    {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-6 relative disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>

                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 mt-6">
                            <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-1">💡 Best Facility Tip</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong>One email, many uses:</strong> Once registered, you can create multiple independent "Expense Books" (Home, Work, etc.) inside your dashboard.
                                <br /><br />
                                <span className="text-slate-500 italic">Pro Tip: Use <code>email+work@gmail.com</code> to create separate specialized accounts.</span>
                            </p>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
