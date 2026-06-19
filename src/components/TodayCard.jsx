import { Clock, MapPin, StickyNote, UsersRound } from 'lucide-react';
import { currency, formatLongDate, formatShortDate, formatTime, formatTimestamp } from '../lib/dateUtils';
import WorkerResponseForm from './WorkerResponseForm';

const statusStyle = {
  'Work Today': 'bg-green-100 text-green-900',
  'No Work': 'bg-warm-100 text-ink',
  Maybe: 'bg-yellow-100 text-yellow-900',
  Confirmed: 'bg-green-100 text-green-900',
  Canceled: 'bg-red-100 text-red-800',
};

function responseFor(responses, workerName) {
  return responses.find((response) => response.workerName === workerName);
}

function responseLabel(response) {
  return response?.availability || 'Not answered';
}

export default function TodayCard({ job, date, responses, user, workerTotals, onSaved }) {
  const zachResponse = responseFor(responses, 'Zach');
  const xanderResponse = responseFor(responses, 'Xander');
  const workerResponse = user.role === 'worker' ? responseFor(responses, user.name) : null;
  const isCanceled = job?.status === 'Canceled';
  const isNoWork = job?.status === 'No Work';
  const selectedDate = job?.date || date || new Date().toISOString().slice(0, 10);
  const dateLabel = formatLongDate(selectedDate);

  return (
    <div className="space-y-3">
      <section className={`card overflow-hidden ${isCanceled ? 'border-red-300 bg-red-50' : ''}`}>
        <p className="text-sm font-black uppercase text-warm-700">{dateLabel}</p>
        {!job ? (
          <div className="py-7">
            <h2 className="text-2xl font-black">No work plan posted.</h2>
            <p className="mt-2 text-sm font-bold text-warm-700">Nothing is scheduled for this date yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-black ${statusStyle[job.status] || statusStyle.Maybe}`}>
                  {job.status}
                </span>
                <h2 className="mt-2 text-3xl font-black leading-tight">
                  {isNoWork ? 'No work today.' : job.jobName || 'Work plan'}
                </h2>
              </div>
            </div>
            {isCanceled ? <p className="rounded-lg bg-red-600 p-3 text-lg font-black text-white">Canceled</p> : null}
            {!isNoWork ? (
              <div className="space-y-3 text-sm font-bold">
                {job.address ? (
                  <a
                    className="flex items-center gap-2 rounded-lg border border-warm-200 bg-warm-50 p-3 text-ink"
                    href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin className="h-5 w-5 shrink-0" />
                    <span>{job.address}</span>
                  </a>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-warm-100 p-3">
                    <Clock className="mb-1 h-5 w-5" />
                    <p className="text-xs text-warm-700">Start</p>
                    <p className="text-lg font-black">{formatTime(job.startTime) || 'TBD'}</p>
                  </div>
                  <div className="rounded-lg bg-warm-100 p-3">
                    <Clock className="mb-1 h-5 w-5" />
                    <p className="text-xs text-warm-700">End</p>
                    <p className="text-lg font-black">{formatTime(job.endTime) || 'TBD'}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-warm-100 p-3">
                  <div className="flex items-start gap-2">
                    <UsersRound className="h-5 w-5" />
                    <p>Needed: {[job.neededWorkers?.zach && 'Zach', job.neededWorkers?.xander && 'Xander', job.neededWorkers?.other].filter(Boolean).join(', ') || 'TBD'}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {job.notes ? (
              <div className="rounded-lg border border-warm-200 p-3">
                <StickyNote className="mb-1 h-5 w-5" />
                <p className="whitespace-pre-wrap text-sm font-bold">{job.notes}</p>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-warm-100 p-3">
                <p className="text-sm font-black">Zach</p>
                <p className="text-sm font-bold text-warm-700">{responseLabel(zachResponse)}</p>
              </div>
              <div className="rounded-lg bg-warm-100 p-3">
                <p className="text-sm font-black">Xander</p>
                <p className="text-sm font-bold text-warm-700">{responseLabel(xanderResponse)}</p>
              </div>
            </div>
            <p className="text-xs font-bold text-warm-700">Last updated {formatTimestamp(job.updatedAt)}</p>
          </div>
        )}
      </section>

      {user.role === 'worker' && job ? (
        <>
          <section className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-ink p-3 text-white">
              <p className="text-xs font-bold">Today</p>
              <p className="text-lg font-black">{workerResponse?.hoursWorked || 0} hrs</p>
            </div>
            <div className="rounded-lg bg-sunshine p-3 text-ink">
              <p className="text-xs font-bold">Earned</p>
              <p className="text-lg font-black">{currency(workerResponse?.dailyPay || 0)}</p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-bold text-warm-700">Unpaid</p>
              <p className="text-lg font-black">{currency(workerTotals.unpaid)}</p>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-bold text-warm-700">Paid</p>
              <p className="text-lg font-black">{currency(workerTotals.paid)}</p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-bold text-warm-700">Lifetime</p>
              <p className="text-lg font-black">{currency(workerTotals.lifetime)}</p>
            </div>
          </section>
          <WorkerResponseForm job={job} existingResponse={workerResponse} workerName={user.name} onSaved={onSaved} />
        </>
      ) : null}

      {user.role === 'admin' && job ? (
        <section className="rounded-lg bg-white p-3 shadow-board">
          <p className="text-xs font-black uppercase text-warm-700">Quick check</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-bold">
            <p className="rounded-lg bg-warm-100 p-2">Zach: {responseLabel(zachResponse)}</p>
            <p className="rounded-lg bg-warm-100 p-2">Xander: {responseLabel(xanderResponse)}</p>
          </div>
          <p className="mt-2 text-xs font-bold text-warm-700">{formatShortDate(job.date)} · Updated {formatTimestamp(job.updatedAt)}</p>
        </section>
      ) : null}
    </div>
  );
}
