import { useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Wallet, Menu, X, ArrowRightLeft, PieChart } from 'lucide-react'

export function RootLayout() {
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const closeMenu = () => setIsMenuOpen(false)

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans relative">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
                    <span className="text-xl font-bold tracking-tight text-slate-900">Expense Wise</span>
                </Link>
                <div className="flex items-center gap-2 text-slate-500">
                    <button onClick={toggleMenu} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute top-[65px] left-0 w-full bg-white border-b border-slate-100 shadow-lg z-30 animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col p-4 space-y-2">
                        <Link
                            to="/transactions"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                        >
                            <ArrowRightLeft className="w-5 h-5 text-blue-500" /> Transactions
                        </Link>
                        <Link
                            to="/statistics"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                        >
                            <PieChart className="w-5 h-5 text-yellow-500" /> Statistics
                        </Link>
                        <Link
                            to="/set-budget"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                        >
                            <PieChart className="w-5 h-5 text-purple-500" /> Budgets
                        </Link>

                        <div className="h-px bg-slate-100 my-2"></div>

                        <button
                            onClick={() => { closeMenu(); handleSignOut(); }}
                            className="flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors w-full text-left"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </nav>
                </div>
            )}

            {/* Overlay to close menu when clicking outside */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20"
                    onClick={closeMenu}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 w-full max-w-lg mx-auto p-4 pb-24 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}
