import { HardHat, RefreshCcw } from 'lucide-react';
import BottomNav from './BottomNav';

export default function Layout({ children, activeTab, setActiveTab, user, isAdmin, switchUser, dbMode }) {
  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 border-b border-warm-200 bg-warm-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sunshine text-ink">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black leading-tight">Sunshine Work Board</h1>
              <p className="text-xs font-bold text-warm-700">{user?.name} · {dbMode === 'firebase' ? 'Live' : 'Local'}</p>
            </div>
          </div>
          <button type="button" onClick={switchUser} className="btn-light !min-h-10 !px-3 !py-2 text-xs">
            <RefreshCcw className="h-4 w-4" />
            Switch
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-3">{children}</main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />
    </div>
  );
}
