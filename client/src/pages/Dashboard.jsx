import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Bug, TrendingUp, CloudRain, ChevronRight, Activity, AlertCircle, Droplets, Landmark } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [trendData, setTrendData] = useState([]);
    const [trendMetrics, setTrendMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrend = async () => {
            try {
                const { data } = await api.get('/market/trend?crop=wheat');
                if (data.success) {
                    setTrendData(data.data.chart_data);
                    setTrendMetrics({
                        volatility: data.data.volatility_status,
                        recommendation: data.data.recommendation,
                        current: data.data.current_price,
                        sma: data.data.sma
                    });
                }
            } catch (error) {
                console.error("Failed to load trend data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrend();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Greeting Section */}
            <section className="mb-10 mt-4">
                <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight leading-tight">
                    Welcome back, <span className="text-primary glow-text">{user?.fullName?.split(' ')[0]}</span>
                </h2>
                <p className="text-on-surface-variant font-body mt-2 max-w-2xl">
                    Your high-altitude diagnostic overview is ready. Field vitality is currently at <span className="text-primary font-bold">87%</span> across all sectors.
                </p>
            </section>

            {/* Bento Grid Feature Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
            >
                {/* Crop Recommendation */}
                <Link to="/crop-rec" className="lg:col-span-1">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Sprout size={28} />
                            </div>
                            <ChevronRight className="text-on-surface-variant/40 group-hover:text-primary transition-colors cursor-pointer" />
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Crop Recs</h3>
                            <p className="text-on-surface-variant text-xs mt-1">Predictive seasonal analysis</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Disease Detection */}
                <Link to="/disease-detect" className="lg:col-span-1">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-error/10 rounded-2xl flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                                <Bug size={28} />
                            </div>
                            <ChevronRight className="text-on-surface-variant/40 group-hover:text-error transition-colors cursor-pointer" />
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Disease Detect</h3>
                            <p className="text-on-surface-variant text-xs mt-1">AI-powered foliage scanning</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Market Insights */}
                <Link to="/market-prices" className="lg:col-span-1">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                <TrendingUp size={28} />
                            </div>
                            <ChevronRight className="text-on-surface-variant/40 group-hover:text-secondary transition-colors cursor-pointer" />
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Market Insights</h3>
                            <p className="text-on-surface-variant text-xs mt-1">Real-time commodity tracking</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Weather */}
                <Link to="/weather" className="lg:col-span-1">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <CloudRain size={28} />
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-headline font-bold text-on-surface">28°C</p>
                                <p className="text-[10px] text-primary">Clear Sky</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Weather</h3>
                            <p className="text-on-surface-variant text-xs mt-1">Localized micro-climate data</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Irrigation */}
                <Link to="/irrigation" className="lg:col-span-1">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Droplets size={28} />
                            </div>
                            <ChevronRight className="text-on-surface-variant/40 group-hover:text-blue-400 transition-colors cursor-pointer" />
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Irrigation</h3>
                            <p className="text-on-surface-variant text-xs mt-1">Smart valve control & scheduling</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Govt Schemes */}
                <Link to="/schemes" className="lg:col-span-2">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Landmark size={28} />
                            </div>
                            <div className="bg-primary-container/20 text-primary text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">Active Policy Support</div>
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Govt Schemes</h3>
                            <p className="text-on-surface-variant text-xs mt-1">Financial aid and policy tracking for rural agronomists</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Fertilizer Calc */}
                <Link to="/fertilizer" className="lg:col-span-1">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                <Activity size={28} />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Nutrient Calc</h3>
                            <p className="text-on-surface-variant text-xs mt-1">Optimized NPK ratio mapping</p>
                        </div>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel rounded-[2.5rem] p-8 min-h-[400px] flex flex-col mb-10"
            >
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
                        <p className="text-on-surface-variant text-sm mt-4">Initializing Data Stream...</p>
                    </div>
                ) : !trendMetrics ? (
                    <div className="glass-card flex-1 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #78dc77 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 mx-auto border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp size={40} className="text-primary/40" />
                            </div>
                            <h4 className="text-on-surface font-headline text-xl font-bold">Awaiting Market Data</h4>
                            <p className="text-on-surface-variant text-sm mt-2 max-w-xs mx-auto">Real-time commodity streams are temporarily unavailable. Initializing fallback diagnostic...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
                                    Wheat Price Terminal
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        trendMetrics.volatility === 'Stable' 
                                        ? "bg-primary/10 border-primary/30 text-primary" 
                                        : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                                    }`}>
                                        {trendMetrics.volatility}
                                    </span>
                                </h3>
                                <p className="text-on-surface-variant text-sm mt-1">Multi-spectral commodity trends and SMA diagnostic</p>
                            </div>
                            <div className="text-right">
                                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">{trendMetrics.recommendation}</p>
                                <p className="text-3xl font-headline font-bold text-on-surface">₹{trendMetrics.current}</p>
                            </div>
                        </div>

                        <div className="glass-card flex-1 h-80 rounded-3xl border border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #78dc77 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#78dc77" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#78dc77" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#10150f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                        itemStyle={{ color: '#78dc77' }}
                                    />
                                    <Area type="monotone" dataKey="price" stroke="#78dc77" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Footer Metric Bar */}
            <footer className="glass-panel rounded-2xl px-8 py-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">System Status: Nominal</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
                    <span>VER: 4.8.2-OMEGA</span>
                    <span className="text-primary/40">|</span>
                    <span>SESSION: STABLE</span>
                </div>
            </footer>
        </div>
    );
}

export default Dashboard;
