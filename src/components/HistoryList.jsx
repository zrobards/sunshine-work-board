import { formatShortDate, formatTime } from '../lib/dateUtils';

const filters = ['All', 'Worked', 'Canceled', 'No Work'];

function workerText(job) {
  return [
    job.neededWorkers?.zach && 'Zach',
    job.neededWorkers?.xander && 'Xander',
    job.neededWorkers?.other,
  ].filter(Boolean).join(', ') || 'None listed';
}

export default function HistoryList({ jobs, responses, filter, setFilter }) {
  const filtered = jobs.filter((job) => {
    if (filter === 'Worked') return ['Work Today', 'Confirmed'].includes(job.status);
    if (filter === 'Canceled') return job.status === 'Canceled';
    if (filter === 'No Work') return job.status === 'No Work';
    return true;
  });

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="text-xl font-black">History</h2>
        <div className="mt-3 grid grid-cols-4 gap-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`tap rounded-lg px-2 text-xs font-black ${filter === item ? 'bg-sunshine' : 'bg-warm-100'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      {filtered.length ? filtered.map((job) => {
        const zach = responses.find((response) => response.date === job.date && response.workerName === 'Zach');
        const xander = responses.find((response) => response.date === job.date && response.workerName === 'Xander');
        return (
          <article key={job.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-warm-700">{formatShortDate(job.date)}</p>
                <h3 className="text-lg font-black">{job.jobName || job.status}</h3>
              </div>
              <span className="rounded-full bg-warm-100 px-3 py-1 text-xs font-black">{job.status}</span>
            </div>
            <p className="text-sm font-bold">{job.address || 'No address'}</p>
            <p className="text-sm text-warm-700">{formatTime(job.startTime) || 'TBD'} · Needed: {workerText(job)}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="rounded-lg bg-warm-100 p-2 font-bold">Zach: {zach?.availability || 'Not answered'}</p>
              <p className="rounded-lg bg-warm-100 p-2 font-bold">Xander: {xander?.availability || 'Not answered'}</p>
            </div>
            {job.notes ? <p className="whitespace-pre-wrap text-sm text-warm-700">{job.notes}</p> : null}
          </article>
        );
      }) : (
        <p className="card text-sm font-bold text-warm-700">No history yet.</p>
      )}
    </div>
  );
}
