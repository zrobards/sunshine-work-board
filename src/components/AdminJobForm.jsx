import { CopyPlus, Save, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { blankJob, clearJob, saveJob } from '../lib/db';
import { todayKey, tomorrowKey } from '../lib/dateUtils';

const statuses = ['Work Today', 'No Work', 'Maybe', 'Confirmed', 'Canceled'];

export default function AdminJobForm({ job, selectedDate = todayKey(), onSaved }) {
  const [form, setForm] = useState(job || blankJob(selectedDate));

  useEffect(() => {
    setForm(job || blankJob(selectedDate));
  }, [job, selectedDate]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateNeeded = (field, value) => setForm((current) => ({
    ...current,
    neededWorkers: { ...current.neededWorkers, [field]: value },
  }));

  async function submit(event) {
    event.preventDefault();
    await saveJob(form);
    onSaved?.('Saved');
  }

  async function markNoWork() {
    const next = {
      ...blankJob(form.date),
      status: 'No Work',
      jobName: 'No work today',
      notes: form.notes,
      neededWorkers: { zach: false, xander: false, other: '' },
    };
    await saveJob(next);
    setForm(next);
    onSaved?.('No work posted');
  }

  async function cancelToday() {
    const next = { ...form, status: 'Canceled' };
    await saveJob(next);
    setForm(next);
    onSaved?.('Canceled');
  }

  async function duplicateTomorrow() {
    const nextDate = tomorrowKey(new Date(`${form.date}T12:00:00`));
    const copy = {
      ...form,
      id: nextDate,
      date: nextDate,
      status: form.status === 'Canceled' ? 'Maybe' : form.status,
      createdAt: undefined,
      updatedAt: undefined,
    };
    await saveJob(copy);
    onSaved?.('Copied to tomorrow');
  }

  async function clearToday() {
    await clearJob(form.date);
    setForm(blankJob(form.date));
    onSaved?.('Cleared');
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <section className="card space-y-3">
        <div>
          <h2 className="text-xl font-black">Admin</h2>
          <p className="text-sm font-bold text-warm-700">Create or update the daily work plan.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={markNoWork} className="btn-light">
            No Work
          </button>
          <button type="button" onClick={cancelToday} className="btn-light text-red-700">
            <XCircle className="h-5 w-5" />
            Cancel
          </button>
        </div>
      </section>

      <section className="card space-y-4">
        <label>
          <span className="label">Date</span>
          <input className="field" type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
        </label>
        <label>
          <span className="label">Status</span>
          <select className="field" value={form.status} onChange={(event) => update('status', event.target.value)}>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Job name</span>
          <input className="field" value={form.jobName || ''} onChange={(event) => update('jobName', event.target.value)} placeholder="Kitchen, bath, punch list..." />
        </label>
        <label>
          <span className="label">Address</span>
          <input className="field" value={form.address || ''} onChange={(event) => update('address', event.target.value)} placeholder="Street, city" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">Start time</span>
            <input className="field" type="time" value={form.startTime || ''} onChange={(event) => update('startTime', event.target.value)} />
          </label>
          <label>
            <span className="label">Est. end</span>
            <input className="field" type="time" value={form.endTime || ''} onChange={(event) => update('endTime', event.target.value)} />
          </label>
        </div>
        <div>
          <span className="label">Needed workers</span>
          <div className="grid grid-cols-2 gap-2">
            <label className="tap flex items-center gap-3 rounded-lg border border-warm-200 bg-white p-3 font-bold">
              <input type="checkbox" checked={Boolean(form.neededWorkers?.zach)} onChange={(event) => updateNeeded('zach', event.target.checked)} />
              Zach
            </label>
            <label className="tap flex items-center gap-3 rounded-lg border border-warm-200 bg-white p-3 font-bold">
              <input type="checkbox" checked={Boolean(form.neededWorkers?.xander)} onChange={(event) => updateNeeded('xander', event.target.checked)} />
              Xander
            </label>
          </div>
        </div>
        <label>
          <span className="label">Needed other</span>
          <input className="field" value={form.neededWorkers?.other || ''} onChange={(event) => updateNeeded('other', event.target.value)} placeholder="Optional" />
        </label>
        <label>
          <span className="label">Notes from Jim</span>
          <textarea className="field min-h-28" value={form.notes || ''} onChange={(event) => update('notes', event.target.value)} placeholder="Tools, materials, reminders..." />
        </label>
        <button type="submit" className="btn-yellow w-full text-base">
          <Save className="h-5 w-5" />
          Save/update day
        </button>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <button type="button" onClick={duplicateTomorrow} className="btn-light">
          <CopyPlus className="h-5 w-5" />
          Duplicate
        </button>
        <button type="button" onClick={clearToday} className="btn-light text-red-700">
          <Trash2 className="h-5 w-5" />
          Clear
        </button>
      </section>
    </form>
  );
}
