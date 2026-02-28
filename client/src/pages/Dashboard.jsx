import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Bug, TrendingUp, CloudRain, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', price: 2100 },
    { name: 'Tue', price: 2150 },
    { name: 'Wed', price: 2120 },
    { name: 'Thu', price: 2200 },
    { name: 'Fri', price: 2250 },
    { name: 'Sat', price: 2230 },
    { name: 'Sun', price: 2300 },
];

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('userInfo'));

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
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold tracking-tight text-white mb-2"
                    >
                        Welcome back, {user?.fullName?.split(' ')[0]}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg"
                    >
                        Here's what's happening on your farm right now.
                    </motion.p>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
            >
                <Link to="/crop-rec">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Sprout size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Crop Recs</h3>
                        <p className="text-sm text-slate-400">Get AI-driven crop suggestions based on active soil data.</p>
                    </motion.div>
                </Link>

                <Link to="/disease-detect">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                                <Bug size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Disease Detect</h3>
                        <p className="text-sm text-slate-400">Scan leaves to instantly identify health issues.</p>
                    </motion.div>
                </Link>

                <Link to="/market-prices">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Market Insights</h3>
                        <p className="text-sm text-slate-400">Live API integration with local mandi commodity prices.</p>
                    </motion.div>
                </Link>

                <Link to="/weather">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full hover:border-sky-500/30 hover:bg-slate-800/80 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                                <CloudRain size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Weather</h3>
                        <p className="text-sm text-slate-400">Hyper-local forecasting & conditions.</p>
                    </motion.div>
                </Link>

                <Link to="/profit">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full hover:border-yellow-500/30 hover:bg-slate-800/80 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Profit Calc</h3>
                        <p className="text-sm text-slate-400">AI-powered farm financial estimations.</p>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-8"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white">Wheat Pricing Trend</h3>
                        <p className="text-sm text-slate-400">Local Mandi average for the last 7 days</p>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-semibold border border-emerald-500/20">
                        +18.5%
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#34D399', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}

export default Dashboard;
