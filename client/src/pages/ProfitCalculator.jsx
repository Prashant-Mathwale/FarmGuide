import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, DollarSign, TrendingUp, AlertCircle, Leaf, MapPin, Map, CloudRain, Thermometer, ShieldAlert, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import api from '../services/api';

function ProfitCalculator() {
    const [formData, setFormData] = useState({
        crop: '',
        area: '',
        location: '',
        rainfall: '',
        pesticides_tonnes: '',
        avg_temp: ''
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await api.post('/profit/calculate', formData);
            if (res.data.success) {
                setResult(res.data.data);
            } else {
                setError(res.data.message || 'Calculation failed.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while connecting to the intelligence server.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    // Helper for a simple CSS dash-array risk gauge meter (half circle)
    const renderGauge = (score) => {
        const radius = 60;
        const circumference = Math.PI * radius;
        const fillOffset = circumference - (score / 100) * circumference;

        // Color based on risk (lower is better, assuming score 0=safest, 100=highest risk)
        let strokeColor = '#3b82f6'; // blue
        if (score > 60) strokeColor = '#ef4444'; // red
        else if (score > 30) strokeColor = '#eab308'; // yellow
        else strokeColor = '#10b981'; // green

        return (
            <div className="relative flex flex-col items-center justify-center p-4">
                <svg width="150" height="80" viewBox="0 0 150 80" className="overflow-visible">
                    {/* Background track (half circle) */}
                    <path
                        d="M 15,80 A 60,60 0 0,1 135,80"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Foreground meter */}
                    <path
                        d="M 15,80 A 60,60 0 0,1 135,80"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={fillOffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute bottom-2 text-center">
                    <span className="text-3xl font-black block" style={{ color: strokeColor }}>{Math.round(score)}</span>
                    <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Risk Score</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto pb-12">
            <header className="mb-10 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30"
                >
                    <Activity size={32} className="text-indigo-400" />
                </motion.div>
                <h2 className="text-4xl font-black tracking-tight text-white mb-2">Advanced Profit Intelligence</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    A machine-learning financial engine simulating dynamic yields, pricing SMA smoothing, and risk sensitivity to model your true farming forecast.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Input Engine Form */}
                <div className="xl:col-span-4">
                    <div className="glass-panel p-6 border-t-4 border-t-indigo-500 h-full">
                        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center">
                            <Leaf className="mr-2 text-indigo-400" size={18} /> Telemetry Inputs
                        </h3>

                        <form onSubmit={handleCalculate} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Crop Identifier</label>
                                    <div className="relative">
                                        <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input type="text" name="crop" placeholder="e.g., Rice, Wheat" className="input-field !pl-10 text-sm" value={formData.crop} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Land Area (Acres)</label>
                                    <div className="relative">
                                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input type="number" name="area" step="0.1" placeholder="e.g., 5" className="input-field !pl-10 text-sm" value={formData.area} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">State</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input type="text" name="location" placeholder="e.g., Punjab" className="input-field !pl-10 text-sm" value={formData.location} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-700/50 my-2" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Rainfall (mm/year)</label>
                                    <div className="relative">
                                        <CloudRain className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input type="number" name="rainfall" step="0.1" placeholder="e.g., 1200" className="input-field !pl-10 text-sm" value={formData.rainfall} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Pesticides (Tonnes)</label>
                                    <div className="relative">
                                        <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input type="number" name="pesticides_tonnes" step="0.01" placeholder="e.g., 1.5" className="input-field !pl-10 text-sm" value={formData.pesticides_tonnes} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Avg Temp (°C)</label>
                                    <div className="relative">
                                        <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input type="number" name="avg_temp" step="0.1" placeholder="e.g., 25.5" className="input-field !pl-10 text-sm" value={formData.avg_temp} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 mt-6 rounded-xl font-bold flex items-center justify-center transition-all ${loading ? ' text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Running Multi-Agent Simulation...
                                    </span>
                                ) : (
                                    <>
                                        <Activity className="mr-2" size={20} /> Run ML Financial Forecast
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Advanced Analytics UI */}
                <div className="xl:col-span-8">
                    <AnimatePresence mode="wait">
                        {!result && !loading && !error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[500px] glass-panel flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-24 h-24 bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                                    <Activity size={48} className="text-indigo-400/50" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-400">Intelligence Engine Standby</h3>
                                <p className="text-slate-500 max-w-sm mt-2">Enter all required dataset telemetry values to trigger the Random Forest Regressor and SMA pricing pipelines.</p>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 border border-red-500/30 bg-red-500/5 flex items-start">
                                <AlertCircle className="text-red-400 mr-4 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="text-lg font-bold text-red-400 mb-1">Compute Error</h4>
                                    <p className="text-slate-300">{error}</p>
                                </div>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">

                                {/* Top Row: Net Profit Hero & Risk Gauge */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="glass-panel md:col-span-2 rounded-2xl p-6 md:p-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.15)] flex flex-col justify-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2 z-10">Forecasted Net Profit</p>
                                        <h2 className={`text-5xl md:text-6xl font-black drop-shadow-md z-10 ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatCurrency(result.netProfit)}
                                        </h2>
                                        <div className="flex items-center space-x-4 mt-4 z-10">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.profitabilityCategory === 'High' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                    result.profitabilityCategory === 'Moderate' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                                        result.profitabilityCategory === 'Low' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                                            'bg-red-500/20 text-red-300 border-red-500/30'
                                                }`}>
                                                {result.profitabilityCategory} Return
                                            </span>
                                            <span className="text-slate-400 text-sm font-medium border-l border-slate-600 pl-4">
                                                Margin: {result.profitMargin.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="glass-panel p-4 flex flex-col items-center justify-center">
                                        <h4 className="text-slate-300 text-sm font-bold uppercase mb-2">Volatility Risk</h4>
                                        {renderGauge(result.riskScore)}
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="glass-panel p-4 pb-5">
                                        <p className="text-slate-500 text-xs font-bold uppercase mb-1">ML Yield Predict</p>
                                        <p className="text-xl font-bold text-white mb-1">{result.predictedYieldTons.toFixed(2)} Tons</p>
                                        <p className="text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md inline-block">{result.predictedYieldPerAcre.toFixed(2)} / Acre</p>
                                    </div>
                                    <div className="glass-panel p-4 pb-5">
                                        <p className="text-slate-500 text-xs font-bold uppercase mb-1">Mandi Price SMA</p>
                                        <p className="text-xl font-bold text-emerald-400 mb-1">{formatCurrency(result.predictedPricePerTon)}</p>
                                        <p className="text-xs text-slate-400">Predicted per Ton</p>
                                    </div>
                                    <div className="glass-panel p-4 pb-5">
                                        <p className="text-slate-500 text-xs font-bold uppercase mb-1">Gross Revenue</p>
                                        <p className="text-xl font-bold text-white mb-1">{formatCurrency(result.expectedRevenue)}</p>
                                        <p className="text-xs text-slate-400">Before expenses</p>
                                    </div>
                                    <div className="glass-panel p-4 pb-5">
                                        <p className="text-slate-500 text-xs font-bold uppercase mb-1">Break-Even Price</p>
                                        <p className="text-xl font-bold text-yellow-500 mb-1">{formatCurrency(result.breakEvenPrice)}</p>
                                        <p className="text-xs text-slate-400">Min. required per Ton</p>
                                    </div>
                                </div>

                                {/* Interactive Sensitivity Analysis Curve */}
                                <div className="glass-panel p-6 border border-slate-700">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="text-lg font-bold text-white flex items-center">
                                                <TrendingUp size={18} className="mr-2 text-indigo-400" /> Sensitivity Analysis Simulation
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1">Simulating simultaneous Yield & Pricing volatilities on Net Profit.</p>
                                        </div>
                                    </div>

                                    <div className="h-64 w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={result.sensitivityAnalysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5} />
                                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="scenario" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <YAxis
                                                    stroke="#64748b"
                                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                                />
                                                <Tooltip
                                                    formatter={(value) => [formatCurrency(value), "Net Profit"]}
                                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                                />
                                                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                                                <Area type="monotone" dataKey="profit" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Dynamic Cost Breakdown Footer */}
                                <div className="glass-panel p-5 mt-4">
                                    <h5 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2">Dynamic Cost Component Analysis ({formatCurrency(result.totalCost)})</h5>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
                                        {Object.entries(result.costBreakdown).map(([key, value]) => (
                                            <div key={key} className=" rounded-lg p-2">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{key}</p>
                                                <p className="text-sm font-semibold text-slate-200">{formatCurrency(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default ProfitCalculator;
