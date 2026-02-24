import { useState, useEffect } from 'react'
import { ArrowRightLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function Transactions() {
    const { activeProfile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [history, setHistory] = useState([])

    const fetchHistory = async () => {
        setLoading(true)
        if (!activeProfile) {
            setLoading(false)
            return
        }
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('profile_id', activeProfile.id)
            .order('date', { ascending: false })
        if (!error) setHistory(data)
        setLoading(false)
    }

    useEffect(() => {
        if (activeProfile) {
            fetchHistory()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProfile])


    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <ArrowRightLeft className="text-blue-500 w-8 h-8" />
                        Transactions
                    </h1>
                    <p className="text-slate-500 mt-1">View all your historical income and expenses.</p>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <span className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></span>
                </div>
            ) : history.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {history.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                        {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{t.category}</p>
                                        <p className="text-sm text-slate-500 font-medium">{new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className={`text-lg font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ArrowRightLeft className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No transactions yet</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Your transaction history will appear here once you add income or expenses from the Dashboard.
                    </p>
                </div>
            )}
        </div>
    )
}
