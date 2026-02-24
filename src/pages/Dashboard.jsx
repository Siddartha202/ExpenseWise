import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, Hash, Pointer, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#14b8a6', '#f97316']

export function Dashboard() {
    const { activeProfile } = useAuth()
    const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0, count: 0 })
    const [pieData, setPieData] = useState([])
    const [budgets, setBudgets] = useState([])
    const [loading, setLoading] = useState(true)
    const [showWelcome, setShowWelcome] = useState(false)

    const currentMonthLabel = format(new Date(), 'MMMM yyyy')

    useEffect(() => {
        if (!activeProfile) return

        // Check if we should show the welcome screen
        if (!sessionStorage.getItem('hasSeenWelcome')) {
            setShowWelcome(true)
            sessionStorage.setItem('hasSeenWelcome', 'true')

            // Hide welcome screen after 3 seconds
            setTimeout(() => {
                setShowWelcome(false)
            }, 3000)
        }

        const fetchData = async () => {
            setLoading(true)
            try {
                // 1. Fetch Transactions for Stats & Charts
                const { data: transactions, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('profile_id', activeProfile.id)

                if (error) throw error

                // 2. Calculate KPI Stats
                const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
                const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
                setStats({
                    income,
                    expenses,
                    balance: income - expenses,
                    count: transactions.length
                })

                // 3. Prepare Pie Chart Data (Expenses by Category)
                const categoryTotals = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
                        return acc
                    }, {})

                setPieData(Object.entries(categoryTotals).map(([name, value]) => ({ name, value })))

                // 4. Fetch Budgets
                const { data: budgetData, error: budgetError } = await supabase
                    .from('budgets')
                    .select('*')
                    .eq('profile_id', activeProfile.id)

                if (!budgetError && budgetData) {
                    setBudgets(budgetData)
                }

            } catch (err) {
                console.error('Error loading dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [activeProfile])

    // Wait until loading is done or welcome screen finishes
    if (loading && !showWelcome) return <div className="flex h-full items-center justify-center"><Wallet className="animate-spin text-emerald-500 w-8 h-8" /></div>

    // Show Welcome Screen overlay
    if (showWelcome) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-500 animate-out fade-out fill-mode-forwards duration-1000 delay-2000">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out flex flex-col items-center text-center px-6">
                    <div className="bg-white p-5 rounded-3xl shadow-xl shadow-emerald-600/20 mb-6">
                        <Wallet className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        WELCOME TO <br /> <span className="text-emerald-100">EXPENSEWISE</span>
                    </h1>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
                <Link
                    to="/add-transaction?type=income"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                >
                    <Plus className="w-5 h-5" /> Add Income
                </Link>
                <Link
                    to="/add-transaction?type=expense"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-2xl border border-slate-200 transition-all shadow-sm"
                >
                    <Minus className="w-5 h-5 text-rose-500" /> Add Expenses
                </Link>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl shrink-0">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Income</p>
                        <p className="text-xl font-bold text-slate-900">₹{stats.income.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl shrink-0">
                        <TrendingDown className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Expenses</p>
                        <p className="text-xl font-bold text-slate-900">₹{stats.expenses.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl shrink-0">
                        <Wallet className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Balance</p>
                        <p className="text-xl font-bold text-slate-900">₹{stats.balance.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl shrink-0">
                        <Hash className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Transactions</p>
                        <p className="text-xl font-bold text-slate-900">{stats.count}</p>
                    </div>
                </div>
            </div>

            {/* Expense Breakdown Donut Chart */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Expense Breakdown</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                {pieData.length === 0 && <Cell fill="#f1f5f9" />}
                            </Pie>
                            {pieData.length > 0 && (
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '13px', color: '#64748b', textAlign: 'left', display: 'flex', flexWrap: 'wrap', gap: '10px' }}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Budgets */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <h3 className="text-lg font-medium text-slate-800 mb-5">Monthly Budgets — {currentMonthLabel}</h3>

                <div className="space-y-4">
                    {budgets.length > 0 ? (
                        budgets.map((b) => {
                            // Map categories to emojis similarly to user's implementation
                            const emojis = {
                                'Food': '🍕',
                                'Transport': '🚗',
                                'Bills': '🧾',
                                'Entertainment': '🎮',
                                'Shopping': '🛍️',
                                'Health': '💊',
                                'Other': '📦'
                            }
                            const emoji = emojis[b.category] || '📦'

                            return (
                                <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{emoji}</span>
                                        <span className="font-medium text-slate-700">{b.category}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 font-medium">₹{Number(b.amount).toLocaleString()}</span>
                                        <Link to="/set-budget" className="text-sm font-medium text-emerald-500 hover:text-emerald-600">
                                            Set budget
                                        </Link>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-slate-400 text-sm mb-3">No budgets set for this month</p>
                            <Link to="/set-budget" className="text-emerald-500 text-sm font-medium hover:underline">
                                Set your first budget
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}
