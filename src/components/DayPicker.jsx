import { CalendarPlus } from 'lucide-react';
import { dateRange, formatDayName, formatMonthDay, todayKey } from '../lib/dateUtils';

const statusClasses = {
  'Work Today': 'bg-green-600',
  Confirmed: 'bg-green-600',
  Maybe: 'bg-yellow-500',
  Canceled: 'bg-red-600',
  'No Work': 'bg-warm-700',
};

function neededSummary(job) {
  if (!job || job.status === 'No Work') return '';
  return [
    job.neededWorkers?.zach && 'Z',
    job.neededWorkers?.xander && 'X',
    job.neededWorkers?.other && '+',
  ].filter(Boolean).join(' ');
}

export default function DayPicker({ jobs, selectedDate, onSelectDate, days = 14, title = 'Schedule' }) {
  const today = todayKey();
  const dates = dateRange(today, days);

  return (
    <section className="card !p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          <p className="text-xs font-bold text-warm-700">Tap a day to view or update it.</p>
        </div>
        <CalendarPlus className="h-5 w-5 text-warm-700" />
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {dates.map((date) => {
          const job = jobs.find((item) => item.date === date);
          const active = selectedDate === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`min-w-[74px] rounded-lg border p-2 text-left transition ${
                active ? 'border-ink bg-sunshine text-ink' : 'border-warm-200 bg-white'
              }`}
            >
              <p className="text-xs font-black uppercase">{date === today ? 'Today' : formatDayName(date)}</p>
              <p className="text-sm font-black">{formatMonthDay(date)}</p>
              <div className="mt-2 flex min-h-5 items-center gap-1">
                {job ? <span className={`h-2.5 w-2.5 rounded-full ${statusClasses[job.status] || 'bg-warm-700'}`} /> : null}
                <span className="text-xs font-black text-warm-700">{neededSummary(job)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
