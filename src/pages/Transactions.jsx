import { useState, useEffect, useRef } from 'react'
import { ArrowRightLeft, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function SwipeableTransaction({ t, onDelete }) {
    const [offsetX, setOffsetX] = useState(0)
    const [isSwiping, setIsSwiping] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const startX = useRef(0)
    const currentX = useRef(0)

    const handleTouchStart = (e) => {
        startX.current = e.touches[0].clientX
        setIsSwiping(true)
    }

    const handleTouchMove = (e) => {
        if (!isSwiping) return
        currentX.current = e.touches[0].clientX
        const diff = startX.current - currentX.current
        // Only allow swiping left (positive diff)
        if (diff > 0) {
            setOffsetX(Math.min(diff, 100))
        } else {
            setOffsetX(0)
        }
    }

    const handleTouchEnd = () => {
        setIsSwiping(false)
        if (offsetX > 60) {
            // Snap to reveal delete button
            setOffsetX(80)
            setShowDelete(true)
        } else {
            // Snap back
            setOffsetX(0)
            setShowDelete(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(t.id)
    }

    const handleClickAway = () => {
        if (showDelete) {
            setOffsetX(0)
            setShowDelete(false)
        }
    }

    return (
        <div className="relative overflow-hidden">
            {/* Delete button behind */}
            <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-full px-6 bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 font-bold text-sm transition-colors"
                >
                    {deleting ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </>
                    )}
                </button>
            </div>

            {/* Swipeable content */}
            <div
                className="relative bg-white flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-default"
                style={{
                    transform: `translateX(-${offsetX}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleClickAway}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                        {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{t.category}</p>
                        <p className="text-sm text-slate-500 font-medium">
                            {new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            {' · '}
                            <span className="text-slate-400">{new Date(t.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </p>
                        {t.note && <p className="text-xs text-slate-400 mt-0.5 italic">"{t.note}"</p>}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </div>
                    {/* Desktop delete button (visible on hover) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        disabled={deleting}
                        className="hidden sm:flex p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/item:opacity-100"
                        title="Delete transaction"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export function Transactions() {
    const { activeProfile } = useAuth()
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [history, setHistory] = useState([])
    const [deleteMsg, setDeleteMsg] = useState('')

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
    }, [activeProfile, location.key])

    // Auto-dismiss delete message
    useEffect(() => {
        if (deleteMsg) {
            const timer = setTimeout(() => setDeleteMsg(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [deleteMsg])

    const handleDelete = async (id) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)

        if (!error) {
            setHistory(prev => prev.filter(t => t.id !== id))
            setDeleteMsg('Transaction deleted successfully! 🗑️')
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <ArrowRightLeft className="text-blue-500 w-8 h-8" />
                        Transactions
                    </h1>
                    <p className="text-slate-500 mt-1">View all your historical income and expenses.</p>
                    <p className="text-xs text-slate-400 mt-1 sm:hidden">← Swipe left on a transaction to delete</p>
                </div>
            </header>

            {/* Delete success message */}
            {deleteMsg && (
                <div
                    className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100 flex items-center gap-2"
                    style={{ animation: 'fadeIn 0.3s ease-out' }}
                >
                    <Trash2 className="w-4 h-4" /> {deleteMsg}
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <span className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></span>
                </div>
            ) : history.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {history.map((t) => (
                            <div key={t.id} className="group/item">
                                <SwipeableTransaction t={t} onDelete={handleDelete} />
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
