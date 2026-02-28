import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Sprout, Bug, TrendingUp, CloudRain, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/');
    };

    const menuItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Crop Recs', icon: Sprout, path: '/crop-rec' },
        { name: 'Disease Detect', icon: Bug, path: '/disease-detect' },
        { name: 'Market Prices', icon: TrendingUp, path: '/market-prices' },
        { name: 'Weather', icon: CloudRain, path: '/weather' },
        { name: 'Profit Calc', icon: TrendingUp, path: '/profit' },
    ];

    return (
        <motion.aside
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 glass-panel border-l-0 border-t-0 border-b-0 rounded-none h-screen fixed left-0 top-0 flex flex-col p-6 z-40"
        >
            <div className="flex items-center space-x-3 mb-12">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg p-2 shadow-lg">
                    <Sprout size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                    FarmGuide
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-slate-700/50">
                <div className="flex items-center space-x-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                        <span className="text-sm font-semibold text-emerald-400">
                            {user?.fullName?.charAt(0) || 'F'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white truncate max-w-[120px]">{user?.fullName}</p>
                        <p className="text-xs text-slate-400 truncate w-[120px]">{user?.phone}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
