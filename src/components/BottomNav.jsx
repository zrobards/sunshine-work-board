import { BriefcaseBusiness, CalendarDays, ClipboardList, DollarSign } from 'lucide-react';

const navItems = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'admin', label: 'Admin', icon: ClipboardList },
  { id: 'history', label: 'History', icon: BriefcaseBusiness },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
];

export default function BottomNav({ activeTab, setActiveTab, isAdmin }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-warm-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const locked = item.id === 'admin' && !isAdmin;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`tap rounded-lg px-2 py-2 text-xs font-extrabold ${
                activeTab === item.id ? 'bg-sunshine text-ink' : 'text-warm-700'
              }`}
              aria-label={locked ? 'Admin requires Jim PIN' : item.label}
            >
              <Icon className="mx-auto mb-1 h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
