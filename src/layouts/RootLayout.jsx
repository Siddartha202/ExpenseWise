import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, LayoutDashboard, Wallet, PieChart, Menu, X, User, ChevronDown, Users, Plus } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function RootLayout() {
    const { user, signOut, profiles, activeProfile, switchProfile } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Transactions', path: '/add-transaction', icon: Wallet },
        { name: 'Budgets', path: '/set-budget', icon: PieChart },
        { name: 'Profile Settings', path: '/profile', icon: User },
    ]

    const Sidebar = () => (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 p-4 shrink-0 transition-transform md:translate-x-0 absolute md:relative z-20">
            <div className="mb-10 px-2 py-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-500 rounded-lg p-2">
                        <Wallet className="w-6 h-6 text-black" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">ExpenseWise</span>
                </div>

                {/* Profile Switcher */}
                <div className="relative" ref={profileMenuRef}>
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all text-left group"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                <Users className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Book</p>
                                <p className="text-sm font-bold text-white truncate">{activeProfile?.name || 'Default'}</p>
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileMenuOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in zoom-in duration-200">
                            <div className="p-2 max-h-48 overflow-y-auto">
                                {profiles.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            switchProfile(p)
                                            setIsProfileMenuOpen(false)
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 last:mb-0 ${activeProfile?.id === p.id
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${activeProfile?.id === p.id ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                        <span className="text-sm font-medium">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    navigate('/profile')
                                    setIsProfileMenuOpen(false)
                                }}
                                className="w-full border-t border-slate-700 p-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Manage Books
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {navLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = location.pathname === link.path
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto border-t border-slate-800 pt-4">
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 mb-2 hover:bg-slate-800 rounded-xl transition-all group">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 group-hover:border-emerald-500/40">
                        {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">
                            {user?.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </Link>
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    Sign out
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
            {/* Mobile top bar */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center px-4 justify-between z-30">
                <span className="text-lg font-bold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" /> ExpenseWise
                </span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex h-full">
                <Sidebar />
            </div>

            {/* Mobile Sidebar overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="h-full w-64 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-20 md:py-8 layout-content">
                <Outlet />
            </div>
        </div>
    )
}
