import { ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { blankResponse, saveWorkerResponse } from '../lib/db';
import { currency } from '../lib/dateUtils';

const availabilityOptions = ['Can work', 'Can’t work', 'Maybe'];

export default function WorkerResponseForm({ job, existingResponse, workerName, onSaved }) {
  const initial = useMemo(
    () => existingResponse || blankResponse(job?.id || job?.date, job?.date, workerName),
    [existingResponse, job?.date, job?.id, workerName],
  );
  const [form, setForm] = useState(initial);
  const [showDetails, setShowDetails] = useState(false);
  const dailyPay = Number(form.hoursWorked || 0) * 25;

  useEffect(() => setForm(initial), [initial]);

  if (!job) return null;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  async function handleSubmit(event) {
    event.preventDefault();
    await saveWorkerResponse({
      ...form,
      jobId: job.id,
      date: job.date,
      workerName,
    });
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <div>
        <h2 className="text-lg font-black">Your answer</h2>
        <p className="text-sm font-bold text-warm-700">Tap availability, enter hours, save.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {availabilityOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => update('availability', option)}
            className={`tap rounded-lg border px-2 py-3 text-sm font-black ${
              form.availability === option ? 'border-ink bg-sunshine' : 'border-warm-200 bg-white'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[4, 6, 8].map((hours) => (
          <button
            key={hours}
            type="button"
            onClick={() => update('hoursWorked', hours)}
            className={`btn-light !px-2 ${Number(form.hoursWorked) === hours ? '!border-ink !bg-sunshine' : ''}`}
          >
            {hours} hrs
          </button>
        ))}
      </div>
      <label>
        <span className="label">Hours worked</span>
        <input
          className="field text-2xl font-black"
          type="number"
          min="0"
          step="0.25"
          inputMode="decimal"
          value={form.hoursWorked || ''}
          onChange={(event) => update('hoursWorked', event.target.value)}
          placeholder="0"
        />
      </label>
      <div className="rounded-lg bg-warm-100 p-3">
        <p className="text-sm font-bold text-warm-700">Today’s earned pay</p>
        <p className="text-2xl font-black">{currency(dailyPay)}</p>
      </div>

      <button type="button" onClick={() => setShowDetails((value) => !value)} className="btn-light w-full !min-h-10 !py-2 text-sm">
        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Optional details
      </button>

      {showDetails ? (
        <div className="space-y-3 rounded-lg bg-warm-50 p-3">
          <label>
            <span className="label">Response note</span>
            <input className="field" value={form.note || ''} onChange={(event) => update('note', event.target.value)} placeholder="Optional" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">Start</span>
              <input className="field" type="time" value={form.startTime || ''} onChange={(event) => update('startTime', event.target.value)} />
            </label>
            <label>
              <span className="label">End</span>
              <input className="field" type="time" value={form.endTime || ''} onChange={(event) => update('endTime', event.target.value)} />
            </label>
          </div>
          <label>
            <span className="label">Work notes</span>
            <textarea className="field min-h-20" value={form.workNotes || ''} onChange={(event) => update('workNotes', event.target.value)} placeholder="Optional" />
          </label>
        </div>
      ) : null}

      <button type="submit" className="btn-yellow w-full text-base">
        <Save className="h-5 w-5" />
        Save
      </button>
    </form>
  );
}
