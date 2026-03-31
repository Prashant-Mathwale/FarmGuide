import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Loader2, Bug } from 'lucide-react';
import api from '../services/api';

function PestPrediction() {
    const [formData, setFormData] = useState({ 
        Temperature_C: '', 
        Humidity_percent: '', 
        Rainfall_mm: '', 
        Soil_pH: '', 
        Nitrogen_N: '', 
        Phosphorus_P: '', 
        Potassium_K: '', 
        Crop_Type: '', 
        Location: '' 
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert numerical inputs
            const payload = {
                ...formData,
                Temperature_C: parseFloat(formData.Temperature_C),
                Humidity_percent: parseFloat(formData.Humidity_percent),
                Rainfall_mm: parseFloat(formData.Rainfall_mm),
                Soil_pH: parseFloat(formData.Soil_pH),
                Nitrogen_N: parseFloat(formData.Nitrogen_N),
                Phosphorus_P: parseFloat(formData.Phosphorus_P),
                Potassium_K: parseFloat(formData.Potassium_K),
            };

            const res = await api.post('/ml/pest-predict', payload);
            setTimeout(() => {
                setResult({
                    pest: res.data.pest,
                    probability: res.data.probability
                });
                setLoading(false);
            }, 1000);
        } catch (err) {
            const errorMsg = err.response && err.response.data && err.response.data.message 
                ? err.response.data.message 
                : 'Error predictive pest analysis';
            alert(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto pb-20">
            <header className="mb-12">
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 flex items-center gap-4 text-glow-strong"
                >
                    <Bug className="text-orange-400 w-12 h-12" /> Pest Prediction
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/70 text-lg font-medium tracking-wide"
                >
                    Predict likely pest outbreaks and risk probability using environmental metrics.
                </motion.p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel p-8 md:p-10 relative overflow-hidden lg:col-span-7"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -z-10" />

                    <h3 className="text-2xl font-bold text-white mb-8">Environmental Factors</h3>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10 w-full">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Weather cluster */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Temp (°C)</label>
                                <input name="Temperature_C" type="number" step="0.1" onChange={handleChange} required className="input-field" placeholder="e.g. 28.5" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Humidity (%)</label>
                                <input name="Humidity_percent" type="number" step="0.1" onChange={handleChange} required className="input-field" placeholder="e.g. 70" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Rainfall (mm)</label>
                                <input name="Rainfall_mm" type="number" step="0.1" onChange={handleChange} required className="input-field" placeholder="e.g. 120" />
                            </div>

                            {/* Soil cluster */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Soil pH</label>
                                <input name="Soil_pH" type="number" step="0.1" onChange={handleChange} required className="input-field" placeholder="e.g. 6.5" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Nitrogen (N)</label>
                                <input name="Nitrogen_N" type="number" onChange={handleChange} required className="input-field" placeholder="mg/kg" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Phosphorus (P)</label>
                                <input name="Phosphorus_P" type="number" onChange={handleChange} required className="input-field" placeholder="mg/kg" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Potassium (K)</label>
                                <input name="Potassium_K" type="number" onChange={handleChange} required className="input-field" placeholder="mg/kg" />
                            </div>

                            {/* Context cluster */}
                            <div className="relative lg:col-span-2">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Crop Type</label>
                                <input name="Crop_Type" type="text" onChange={handleChange} required className="input-field" placeholder="e.g. Rice, Wheat, Cotton" />
                            </div>
                            <div className="relative lg:col-span-3">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 opacity-90">Location / State</label>
                                <input name="Location" type="text" onChange={handleChange} required className="input-field" placeholder="e.g. Maharashtra, Punjab" />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            style={{ background: 'linear-gradient(to right, #fb923c, #c2410c)' }}
                            className="w-full btn-primary text-lg mt-10 flex justify-center items-center py-4 border-none"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Run Prediction Model'}
                        </button>
                    </form>
                </motion.div>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="glass-panel p-8 md:p-10 border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] lg:col-span-5 h-fit"
                        >
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-full p-2 border-4 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                                    <ShieldAlert size={32} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Analysis Result</h3>
                                    <p className="text-xs text-orange-200 uppercase tracking-widest mt-1">AI Risk Assessment</p>
                                </div>
                            </div>

                            <div className="space-y-8 relative">
                                <div className="glass-card p-6 border-l-4 border-orange-500 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] -z-10" />
                                    <p className="text-sm text-white/60 font-bold uppercase tracking-wider mb-2">Likely Pest Threat</p>
                                    <h4 className="text-3xl font-black text-white capitalize">{result.pest}</h4>
                                </div>

                                <div className="glass-card p-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-sm text-white/60 font-bold uppercase tracking-wider">Outbreak Probability</p>
                                        <span className="text-2xl font-bold text-orange-400">{result.probability.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-3 rounded-full mt-2 overflow-hidden bg-white/5 border border-white/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(result.probability, 100)}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`h-full rounded-full ${
                                                result.probability > 75 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                result.probability > 40 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                                                'bg-gradient-to-r from-green-400 to-emerald-500'
                                            }`}
                                        />
                                    </div>
                                    <p className="text-xs text-center mt-3 text-white/50">
                                        {result.probability > 75 ? 'Critical risk. Pre-emptive action highly advised.' :
                                         result.probability > 40 ? 'Moderate risk. Begin monitoring affected areas.' :
                                         'Low risk. Maintain standard agricultural practices.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setResult(null)}
                                className="w-full mt-10 py-4 font-bold text-orange-400 hover:text-orange-300 transition-all bg-orange-500/10 rounded-xl border border-orange-500/20 hover:bg-orange-500/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] text-lg"
                            >
                                Clear Analysis
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default PestPrediction;
