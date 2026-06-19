import { Clock3 } from 'lucide-react';
import { addDaysKey, formatShortDate, formatTime, todayKey } from '../lib/dateUtils';

function needed(job) {
  return [
    job.neededWorkers?.zach && 'Zach',
    job.neededWorkers?.xander && 'Xander',
    job.neededWorkers?.other,
  ].filter(Boolean).join(', ') || 'None listed';
}

function responseSummary(responses, date, workerName) {
  const response = responses.find((item) => item.date === date && item.workerName === workerName);
  const answer = response?.availability || 'Not answered';
  const hours = Number(response?.hoursWorked || 0);
  return hours ? `${answer} · ${hours}h` : answer;
}

export default function ScheduleList({ jobs, responses, selectedDate, onSelectDate }) {
  const today = todayKey();
  const end = addDaysKey(today, 14);
  const upcoming = jobs
    .filter((job) => job.date >= today && job.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!upcoming.length) {
    return null;
  }

  return (
    <section className="card space-y-2">
      <div>
        <h2 className="text-lg font-black">Upcoming posted days</h2>
        <p className="text-xs font-bold text-warm-700">Needed workers, answers, and submitted hours.</p>
      </div>
      <div className="space-y-2">
        {upcoming.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelectDate(job.date)}
            className={`w-full rounded-lg border p-3 text-left ${
              selectedDate === job.date ? 'border-ink bg-sunshine/40' : 'border-warm-200 bg-warm-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black">{formatShortDate(job.date)} · {job.status}</p>
                <p className="text-base font-black">{job.jobName || 'Work plan'}</p>
              </div>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-black">{needed(job)}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-warm-700">
              <p className="rounded-lg bg-white p-2">Zach: {responseSummary(responses, job.date, 'Zach')}</p>
              <p className="rounded-lg bg-white p-2">Xander: {responseSummary(responses, job.date, 'Xander')}</p>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs font-bold text-warm-700">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTime(job.startTime) || 'TBD'} - {formatTime(job.endTime) || 'TBD'}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
