import { LockKeyhole, UserRound } from 'lucide-react';

const users = [
  { name: 'Jim', role: 'admin', fullName: 'Jim Hisle' },
  { name: 'Zach', role: 'worker', fullName: 'Zach' },
  { name: 'Xander', role: 'worker', fullName: 'Xander' },
];

export default function UserPicker({ onSelect, adminPin, error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-50 px-4 py-8">
      <section className="w-full max-w-md">
        <div className="mb-5 rounded-lg bg-sunshine p-5 text-ink shadow-board">
          <p className="text-sm font-black uppercase tracking-wide">Sunshine Remodeling</p>
          <h1 className="mt-1 text-3xl font-black leading-tight">Sunshine Work Board</h1>
          <p className="mt-2 text-sm font-bold">Pick your name to see today’s plan, hours, and pay.</p>
        </div>
        <div className="card space-y-3">
          {users.map((user) => (
            <button
              key={user.name}
              type="button"
              onClick={() => onSelect(user)}
              className="btn-light w-full justify-between text-base"
            >
              <span className="flex items-center gap-3">
                {user.role === 'admin' ? <LockKeyhole className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                {user.name}
              </span>
              <span className="text-xs text-warm-700">{user.role === 'admin' ? 'PIN required' : 'Worker'}</span>
            </button>
          ))}
          <p className="rounded-lg bg-warm-100 p-3 text-sm font-bold text-warm-700">
            Jim’s default PIN is {adminPin}. Change it in `.env` with `VITE_ADMIN_PIN`.
          </p>
          {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}
