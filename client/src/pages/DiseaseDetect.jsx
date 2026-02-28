import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertTriangle, ScanLine, X } from 'lucide-react';
import api from '../services/api';

function DiseaseDetect() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef(null);

    const handleImageChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageChange(e.dataTransfer.files[0]);
        }
    };

    const handleDetect = async () => {
        if (!selectedImage) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const res = await api.post('/ml/disease-detect', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Simulate slight delay for the premium "scanning" animation feel
            setTimeout(() => {
                setResult(res.data);
                setLoading(false);
            }, 1200);
        } catch (err) {
            console.error('Detection Error:', err);
            alert('Detection failed. Please make sure the ML server is running.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <header className="mb-10 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-500/30"
                >
                    <ScanLine size={32} className="text-teal-400" />
                </motion.div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Automated Diagnostic Tool</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Upload high-resolution multispectral imagery of the affected biomass to initiate CNN classification profiling.</p>
            </header>

            <div className="glass-panel p-8">
                {!previewUrl ? (
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current.click()}
                        className={`w-full h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-teal-400 bg-teal-500/10' : 'border-slate-600 hover:border-teal-500 bg-slate-800/40 hover:bg-slate-800/60'}`}
                    >
                        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700 text-slate-400'}`}>
                            <UploadCloud size={40} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Drag & drop image here</h3>
                        <p className="text-slate-400 text-sm">Or click to browse from your computer (JPEG, PNG)</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={(e) => handleImageChange(e.target.files[0])}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/50 border border-slate-700 group">
                            <img src={previewUrl} alt="Crop Leaf" className="w-full h-full object-cover max-h-[400px]" />
                            {!loading && !result && (
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            {loading && (
                                <div className="absolute inset-0 bg-teal-900/40 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-teal-500 shadow-[inset_0_0_50px_rgba(20,184,166,0.3)]">
                                    <ScanLine size={48} className="text-teal-400 animate-pulse mb-4" />
                                    <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-400 animate-waving-pulse" style={{ width: '50%', animation: 'sweep 2s infinite ease-in-out alternate' }} />
                                    </div>
                                    <style>{`@keyframes sweep { 0% { transform: translateX(-100%) } 100% { transform: translateX(200%) } }`}</style>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center h-full">
                            {!result && !loading && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h3 className="text-2xl font-bold text-white mb-2">Image Ready</h3>
                                    <p className="text-slate-400 mb-8">Initiate the analysis when you're ready.</p>
                                    <button onClick={handleDetect} className="btn-primary w-full text-lg py-4 flex items-center justify-center shadow-teal-500/20">
                                        <ScanLine className="mr-2" size={24} /> Run Diagnostics
                                    </button>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 shadow-xl"
                                    >
                                        <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-700">
                                            <div>
                                                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Detected Pathogen</p>
                                                <h4 className="text-2xl font-bold text-red-400 flex items-center">
                                                    <AlertTriangle className="mr-2" size={24} /> {result.detectedDisease}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="inline-flex items-center px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm font-bold">
                                                    {Number(result.confidenceScore).toFixed(1)}% Conf
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Recommended Protocol</p>
                                            <p className="text-white text-lg leading-relaxed">{result.suggestedAction}</p>
                                        </div>

                                        <button onClick={() => { setPreviewUrl(null); setResult(null); }} className="w-full btn-secondary">
                                            Scan Another Image
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DiseaseDetect;
