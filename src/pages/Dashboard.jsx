import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, Activity, DollarSign, Plus, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'


const COLORS = ['#39FF14', '#0ea5e9', '#8b5cf6', '#FF3131', '#f59e0b']

export function Dashboard() {
    const { activeProfile, user } = useAuth()
    const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0, count: 0 })
    const [pieData, setPieData] = useState([])
    const [lineData, setLineData] = useState([])
    const [recentTransactions, setRecentTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!activeProfile) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // 1. Fetch Transactions for Stats & Charts
                const { data: transactions, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('profile_id', activeProfile.id)
                    .order('date', { ascending: true })

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

                // 4. Prepare Line Chart Data (Last 6 Months)
                const months = Array.from({ length: 6 }).map((_, i) => {
                    const d = subMonths(new Date(), 5 - i)
                    return format(d, 'MMM')
                })

                const trendData = months.map(m => {
                    const monthTrans = transactions.filter(t => format(new Date(t.date), 'MMM') === m)
                    return {
                        name: m,
                        income: monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
                        expenses: monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
                    }
                })
                setLineData(trendData)

                // 5. Fetch Recent Transactions
                const { data: recent, error: recentError } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('profile_id', activeProfile.id)
                    .order('date', { ascending: false }, { created_at: false })
                    .limit(5)

                if (!recentError) setRecentTransactions(recent)

            } catch (err) {
                console.error('Error loading dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [activeProfile])

    if (loading) return <div className="flex h-full items-center justify-center"><Activity className="animate-spin text-emerald-500 w-8 h-8" /></div>

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-400 mt-1">Here's your financial summary at a glance.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/add-transaction?type=income"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-5 h-5" /> Add Income
                    </Link>
                    <Link
                        to="/add-transaction?type=expense"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5 text-rose-500" /> Add Expense
                    </Link>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-400 font-medium">Total Income</h3>
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mt-4">₹{stats.income.toLocaleString()}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-colors">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-400 font-medium">Total Expenses</h3>
                        <div className="bg-rose-500/10 p-2 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-rose-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mt-4">₹{stats.expenses.toLocaleString()}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-400 font-medium">Balance</h3>
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mt-4">₹{stats.balance.toLocaleString()}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-400 font-medium">Transactions</h3>
                        <div className="bg-purple-500/10 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mt-4">{stats.count}</p>
                </div>
            </div>

            {/* Charts Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                {/* Pie Chart */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl lg:col-span-1 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-white self-start w-full mb-6 relative">
                        Expense Breakdown
                        <div className="absolute -bottom-2 left-0 w-8 h-1 bg-emerald-500 rounded-full"></div>
                    </h3>
                    <div className="w-full h-64 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    {pieData.length === 0 && <Cell fill="#1e293b" />}
                                </Pie>
                                {pieData.length > 0 && (
                                    <>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                    </>
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Line Chart */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl lg:col-span-2 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 relative">
                        Spending Trends
                        <div className="absolute -bottom-2 left-0 w-8 h-1 bg-blue-500 rounded-full"></div>
                    </h3>
                    <div className="w-full h-64 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={lineData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} fontSize={12} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} iconType="circle" />
                                <Line type="monotone" dataKey="income" name="Income" stroke="#39FF14" strokeWidth={3} dot={{ r: 4, fill: '#39FF14' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#FF3131" strokeWidth={3} dot={{ r: 4, fill: '#FF3131' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Recent Transactions List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white relative">
                        Recent Transactions
                        <div className="absolute -bottom-2 left-0 w-8 h-1 bg-purple-500 rounded-full"></div>
                    </h3>
                    <Link to="/add-transaction" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group">
                        View More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                        {t.type === 'income' ? (
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5 text-rose-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{t.category}</p>
                                        <p className="text-xs text-slate-500">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                                <div className={`text-lg font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.type === 'income' ? '+' : '-'} ₹{Number(t.amount).toLocaleString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-500 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                            No transactions found. Start by adding one!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
