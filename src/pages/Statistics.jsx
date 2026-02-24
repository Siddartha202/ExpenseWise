import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function Statistics() {
    const { activeProfile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        if (activeProfile) {
            fetchStats()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProfile])

    const fetchStats = async () => {
        setLoading(true)
        if (!activeProfile) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('transactions')
            .select('category, amount')
            .eq('profile_id', activeProfile.id)
            .eq('type', 'expense')

        if (error) {
            console.error('Error fetching stats:', error)
            setLoading(false)
            return
        }

        const expensesByCategory = data.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount)
            return acc
        }, {})

        const formattedData = Object.keys(expensesByCategory).map(key => ({
            name: key,
            value: expensesByCategory[key]
        })).sort((a, b) => b.value - a.value)

        setChartData(formattedData)
        setLoading(false)
    }

    // A set of diverse, vibrant colors for the pie chart slices
    const COLORS = ['#3B82F6', '#8B5CF6', '#F43F5E', '#10B981', '#F59E0B', '#0EA5E9', '#D946EF']

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <PieChartIcon className="text-yellow-500 w-8 h-8" />
                        Statistics
                    </h1>
                    <p className="text-slate-500 mt-1">Expense breakdown by category.</p>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <span className="w-8 h-8 border-4 border-slate-200 border-t-yellow-500 rounded-full animate-spin"></span>
                </div>
            ) : chartData.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={110}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `₹${value.toLocaleString()}`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <PieChartIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No data available</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Add some expenses first to see your spending statistics.
                    </p>
                </div>
            )}
        </div>
    )
}
