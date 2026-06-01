import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color, gradient, trend, trendValue, index = 0, subtitle }) {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="stat-card relative overflow-hidden group"
    >
      {/* Background decoration */}
      <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: gradient || color }} />
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h3>
          {subtitle && <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: gradient || `${color}20` }}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
          <span className="text-slate-400 text-xs">مقارنة بالشهر الماضي</span>
        </div>
      )}
    </motion.div>
  );
}