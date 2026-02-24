import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, ArrowRightLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function AddTransaction() {
    const { user, activeProfile } = useAuth()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const typeParam = searchParams.get('type')

    const [type, setType] = useState(typeParam === 'income' ? 'income' : 'expense')
    const categories = {
        expense: ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Health', 'Other'],
        income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']
    }

    const [category, setCategory] = useState(typeParam === 'income' ? categories.income[0] : categories.expense[0])
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (typeParam === 'income' || typeParam === 'expense') {
            setType(typeParam)
            setCategory(categories[typeParam][0])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeParam])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const { error } = await supabase.from('transactions').insert([
                {
                    user_id: user?.id,
                    profile_id: activeProfile?.id,
                    type,
                    category,
                    amount: parseFloat(amount),
                    date
                }
            ])

            if (error) throw error

            setMessage('Transaction added successfully! 🎉')
            setAmount('')

            // Redirect back to dashboard after a short delay
            setTimeout(() => {
                navigate('/')
            }, 1500)

        } catch (error) {
            console.error(error)
            setMessage('We encountered an issue adding the transaction. Wait for Supabase connection.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <ArrowRightLeft className="text-emerald-500 w-8 h-8" />
                    {type === 'income' ? 'Add Income' : 'Add Expense'}
                </h1>
                <p className="text-slate-500 mt-1">Easily log a new piece of income or expense.</p>
            </header>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                {message && (
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 flex items-center gap-2 border border-emerald-100">
                        <span className="text-xl">✅</span> {message}
                    </div>
                )}

                {/* Type Toggle Only shown if not explicitly picking via dashboard */}
                {!typeParam && (
                    <div className="flex bg-slate-50 p-1 rounded-xl mb-8 border border-slate-100">
                        <button
                            type="button"
                            className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${type === 'expense'
                                ? 'bg-rose-50 border border-rose-200 text-rose-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                            onClick={() => { setType('expense'); setCategory(categories.expense[0]) }}
                        >
                            <ArrowDownRight className="w-5 h-5" /> Expense
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${type === 'income'
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                            onClick={() => { setType('income'); setCategory(categories.income[0]) }}
                        >
                            <ArrowUpRight className="w-5 h-5" /> Income
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-semibold">₹</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    min="0"
                                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-bold text-lg placeholder-slate-400 transition-all outline-none"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 transition-all outline-none"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {categories[type].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${category === cat
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    onClick={() => setCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all duration-200 shadow-sm mt-8 ${type === 'expense'
                            ? 'bg-rose-500 hover:bg-rose-600 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <Plus className="w-6 h-6" />
                                Save {type === 'income' ? 'Income' : 'Expense'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
