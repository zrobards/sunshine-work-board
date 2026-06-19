import { CheckCircle2, CircleDollarSign, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { updatePayment } from '../lib/db';
import { currency, formatShortDate } from '../lib/dateUtils';

const workers = ['Zach', 'Xander'];

function hasPayRecord(response) {
  return Number(response.hoursWorked || 0) > 0 || Number(response.dailyPay || 0) > 0;
}

export function calculatePayroll(responses) {
  const payRecords = responses.filter(hasPayRecord).map((response) => ({
    ...response,
    dailyPay: Number(response.dailyPay || Number(response.hoursWorked || 0) * 25),
  }));
  const byWorker = Object.fromEntries(workers.map((worker) => {
    const records = payRecords.filter((record) => record.workerName === worker);
    const unpaid = records
      .filter((record) => record.paymentStatus !== 'Paid')
      .reduce((sum, record) => sum + record.dailyPay, 0);
    const paid = records
      .filter((record) => record.paymentStatus === 'Paid')
      .reduce((sum, record) => sum + record.dailyPay, 0);
    return [worker, { unpaid, paid, lifetime: unpaid + paid }];
  }));
  return {
    payRecords,
    byWorker,
    totalUnpaid: workers.reduce((sum, worker) => sum + byWorker[worker].unpaid, 0),
    totalPaid: workers.reduce((sum, worker) => sum + byWorker[worker].paid, 0),
  };
}

export default function Payroll({ responses, jobs, user, isAdmin }) {
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState('');
  const payroll = calculatePayroll(responses);
  const visibleRecords = isAdmin
    ? payroll.payRecords
    : payroll.payRecords.filter((record) => record.workerName === user.name);
  const workerSummary = payroll.byWorker[user.name] || { unpaid: 0, paid: 0, lifetime: 0 };

  async function changeStatus(record, status) {
    setBusyId(`${record.id}-${status}`);
    await updatePayment(record, status, { note });
    setBusyId('');
  }

  async function markWorkerPaid(workerName) {
    const records = payroll.payRecords.filter((record) => record.workerName === workerName && record.paymentStatus !== 'Paid');
    for (const record of records) {
      await updatePayment(record, 'Paid', { note });
    }
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="text-xl font-black">Payroll</h2>
        <p className="text-sm font-bold text-warm-700">
          {isAdmin ? 'Jim can mark pay records paid, unpaid, or needs review.' : 'Your hours, paid records, and unpaid total.'}
        </p>
      </section>

      {isAdmin ? (
        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white p-3 shadow-board">
            <p className="text-xs font-bold text-warm-700">Zach unpaid</p>
            <p className="text-2xl font-black">{currency(payroll.byWorker.Zach.unpaid)}</p>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-board">
            <p className="text-xs font-bold text-warm-700">Xander unpaid</p>
            <p className="text-2xl font-black">{currency(payroll.byWorker.Xander.unpaid)}</p>
          </div>
          <div className="rounded-lg bg-ink p-3 text-white shadow-board">
            <p className="text-xs font-bold">Total unpaid</p>
            <p className="text-2xl font-black">{currency(payroll.totalUnpaid)}</p>
          </div>
          <div className="rounded-lg bg-sunshine p-3 text-ink shadow-board">
            <p className="text-xs font-bold">Total paid</p>
            <p className="text-2xl font-black">{currency(payroll.totalPaid)}</p>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-ink p-3 text-white shadow-board">
            <p className="text-xs font-bold">Unpaid</p>
            <p className="text-xl font-black">{currency(workerSummary.unpaid)}</p>
          </div>
          <div className="rounded-lg bg-sunshine p-3 text-ink shadow-board">
            <p className="text-xs font-bold">Paid</p>
            <p className="text-xl font-black">{currency(workerSummary.paid)}</p>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-board">
            <p className="text-xs font-bold text-warm-700">Total</p>
            <p className="text-xl font-black">{currency(workerSummary.lifetime)}</p>
          </div>
        </section>
      )}

      {isAdmin ? (
        <section className="card space-y-3">
          <label>
            <span className="label">Payment note</span>
            <input className="field" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Cash, check, Venmo..." />
          </label>
          <div className="grid grid-cols-2 gap-2">
            {workers.map((worker) => (
              <button key={worker} type="button" onClick={() => markWorkerPaid(worker)} className="btn-yellow">
                Pay all {worker}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        {visibleRecords.length ? visibleRecords.map((record) => {
          const job = jobs.find((item) => item.date === record.date);
          return (
            <article key={record.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-warm-700">{formatShortDate(record.date)} · {record.workerName}</p>
                  <h3 className="text-lg font-black">{job?.jobName || 'Work record'}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${
                  record.paymentStatus === 'Paid' ? 'bg-green-100 text-green-900' :
                    record.paymentStatus === 'Needs Review' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-900'
                }`}>
                  {record.paymentStatus || 'Unpaid'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-warm-100 p-2">
                  <p className="text-xs font-bold text-warm-700">Hours</p>
                  <p className="text-lg font-black">{record.hoursWorked || 0}</p>
                </div>
                <div className="rounded-lg bg-warm-100 p-2">
                  <p className="text-xs font-bold text-warm-700">Rate</p>
                  <p className="text-lg font-black">$25</p>
                </div>
                <div className="rounded-lg bg-warm-100 p-2">
                  <p className="text-xs font-bold text-warm-700">Owed</p>
                  <p className="text-lg font-black">{currency(record.dailyPay)}</p>
                </div>
              </div>
              {record.workNotes ? <p className="whitespace-pre-wrap text-sm font-bold text-warm-700">{record.workNotes}</p> : null}
              {isAdmin ? (
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" disabled={busyId === `${record.id}-Paid`} onClick={() => changeStatus(record, 'Paid')} className="btn-light !px-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Paid
                  </button>
                  <button type="button" disabled={busyId === `${record.id}-Unpaid`} onClick={() => changeStatus(record, 'Unpaid')} className="btn-light !px-2">
                    <RotateCcw className="h-4 w-4" />
                    Unpaid
                  </button>
                  <button type="button" disabled={busyId === `${record.id}-Needs Review`} onClick={() => changeStatus(record, 'Needs Review')} className="btn-light !px-2 text-red-700">
                    <ShieldAlert className="h-4 w-4" />
                    Review
                  </button>
                </div>
              ) : (
                <p className="flex items-center gap-2 text-sm font-bold text-warm-700">
                  <CircleDollarSign className="h-4 w-4" />
                  {record.paymentStatus === 'Paid' ? `Paid ${record.paidDate || ''}` : 'Not paid yet'}
                </p>
              )}
            </article>
          );
        }) : (
          <p className="card text-sm font-bold text-warm-700">No time records yet.</p>
        )}
      </section>
    </div>
  );
}
