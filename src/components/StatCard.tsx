import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string; // tailwind bg class like 'bg-primary-600'
  bgLight: string; // tailwind bg class like 'bg-primary-50'
  textColor: string; // tailwind text class like 'text-primary-600'
  delay?: number;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgLight,
  textColor,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card-premium p-5 flex items-center gap-4 cursor-pointer group"
    >
      <div
        className={`w-12 h-12 rounded-xl ${bgLight} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
          {title}
        </p>
        <AnimatedCounter
          value={value}
          className="text-2xl font-bold text-slate-900 dark:text-white"
        />
      </div>
    </motion.div>
  );
}