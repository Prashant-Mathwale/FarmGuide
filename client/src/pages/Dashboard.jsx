import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
 adding_pest_pred
import { Sprout, Bug, TrendingUp, CloudRain, ChevronRight, Activity, AlertCircle, Droplets, Landmark, AlertTriangle } from 'lucide-react';

import { Sprout, Bug, TrendingUp, CloudRain, ChevronRight, Activity, AlertCircle, Droplets, Landmark } from 'lucide-react';

 main
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
                <Link to="/schemes" className="lg:col-span-1">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Landmark size={28} />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Govt Schemes</h3>
                            <p className="text-on-surface-variant text-xs mt-1">Financial aid and policy tracking for rural agronomists</p>
                        </div>
                    </motion.div>
                </Link>

                {/* Pest Prediction */}
                <Link to="/pest-predict" className="lg:col-span-1">
                    <motion.div variants={itemVariants} className="glass-panel glass-card-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group h-48">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                <AlertTriangle size={28} />
                            </div>
                            <ChevronRight className="text-on-surface-variant/40 group-hover:text-orange-400 transition-colors cursor-pointer" />
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-bold text-on-surface">Pest Predict</h3>
                            <p className="text-on-surface-variant text-xs mt-1">Predict pest outbreaks & risk probability</p>
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

 adding_pest_pred


 main

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
