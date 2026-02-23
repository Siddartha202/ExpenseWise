import { useState, useEffect } from 'react'
import { PieChart, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function Budgets() {
    const { user, activeProfile } = useAuth()
    const [category, setCategory] = useState('Food')
    const [amount, setAmount] = useState('')
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7) + '-01')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const [budgets, setBudgets] = useState([])

    useEffect(() => {
        if (activeProfile) {
            fetchBudgets()
        }
    }, [activeProfile])

    const fetchBudgets = async () => {
        try {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('profile_id', activeProfile.id)
            if (error) throw error
            setBudgets(data)
        } catch (error) {
            console.error('Error fetching budgets:', error)
        }
    }

    const categories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Health', 'Other']

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const { error } = await supabase.from('budgets').upsert([
                {
                    user_id: user?.id,
                    profile_id: activeProfile?.id,
                    category,
                    month,
                    amount: parseFloat(amount)
                }
            ], { onConflict: 'profile_id, category, month' })

            if (error) throw error

            setMessage('Budget set successfully! 🎯')
            setAmount('')
            fetchBudgets()
        } catch (error) {
            console.error(error)
            setMessage('Failed to set budget. Wait for database connection.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <PieChart className="text-purple-500 w-8 h-8" />
                    Budgets & Limits
                </h1>
                <p className="text-slate-400 mt-1">Set monthly limits to track your spending effectively.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Set Budget Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-1 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">Set Budget</h2>
                    </div>

                    {message && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg mb-4 text-sm">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Month</label>
                            <input
                                type="month"
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white outline-none [color-scheme:dark]"
                                value={month.slice(0, 7)}
                                onChange={(e) => setMonth(e.target.value + '-01')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white outline-none appearance-none"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Limit Amount (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white font-medium outline-none"
                                placeholder="5000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 mt-4"
                        >
                            {loading ? 'Saving...' : 'Save Limit'}
                        </button>
                    </form>
                </div>

                {/* Active Budgets Overview */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Current Budgets Overview</h2>

                    {budgets.map(b => {
                        const isOver = b.spent > b.amount
                        const percentage = Math.min((b.spent / b.amount) * 100, 100)

                        return (
                            <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm group hover:border-slate-700 transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isOver ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                                            {isOver ? <AlertTriangle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{b.category}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-400">₹{b.spent} / ₹{b.amount}</div>
                                    </div>
                                </div>

                                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>

                                {isOver && (
                                    <p className="text-rose-400 text-xs font-medium mt-3 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Over budget by ₹{b.spent - b.amount}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
