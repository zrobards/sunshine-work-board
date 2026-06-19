import { useEffect, useMemo, useState } from 'react';
import AdminJobForm from './components/AdminJobForm';
import HistoryList from './components/HistoryList';
import Layout from './components/Layout';
import Payroll, { calculatePayroll } from './components/Payroll';
import TodayCard from './components/TodayCard';
import UserPicker from './components/UserPicker';
import { initDb, subscribeBoard } from './lib/db';
import { todayKey } from './lib/dateUtils';

const SELECTED_USER_KEY = 'sunshine.selectedUser.v1';
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';

function loadSelectedUser() {
  try {
    return JSON.parse(localStorage.getItem(SELECTED_USER_KEY));
  } catch {
    return null;
  }
}

function saveSelectedUser(user) {
  localStorage.setItem(SELECTED_USER_KEY, JSON.stringify(user));
}

export default function App() {
  const [user, setUser] = useState(loadSelectedUser);
  const [activeTab, setActiveTab] = useState('today');
  const [pinError, setPinError] = useState('');
  const [dbMode, setDbMode] = useState('local');
  const [jobs, setJobs] = useState([]);
  const [responses, setResponses] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [toast, setToast] = useState('');
  const today = todayKey();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let unsubscribe = () => {};
    initDb()
      .then(({ mode }) => {
        setDbMode(mode);
        unsubscribe = subscribeBoard((state) => {
          setJobs(state.jobs);
          setResponses(state.responses);
          setDbMode(state.mode);
        });
      })
      .catch((error) => {
        console.error(error);
        setDbMode('local');
        unsubscribe = subscribeBoard((state) => {
          setJobs(state.jobs);
          setResponses(state.responses);
        });
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!isAdmin && activeTab === 'admin') {
      setActiveTab('today');
    }
  }, [activeTab, isAdmin]);

  const todayJob = useMemo(() => jobs.find((job) => job.date === today), [jobs, today]);
  const todayResponses = useMemo(() => responses.filter((response) => response.date === today), [responses, today]);
  const payroll = useMemo(() => calculatePayroll(responses), [responses]);
  const workerTotals = user?.role === 'worker'
    ? payroll.byWorker[user.name] || { unpaid: 0, paid: 0, lifetime: 0 }
    : { unpaid: 0, paid: 0, lifetime: 0 };
  const historyJobs = useMemo(
    () => jobs.filter((job) => job.date < today).sort((a, b) => b.date.localeCompare(a.date)),
    [jobs, today],
  );

  function handleSelect(nextUser) {
    setPinError('');
    if (nextUser.role === 'admin') {
      const pin = window.prompt('Enter Jim admin PIN');
      if (pin !== ADMIN_PIN) {
        setPinError('Incorrect PIN. Try Jim again or pick a worker.');
        return;
      }
    }
    setUser(nextUser);
    saveSelectedUser(nextUser);
    setActiveTab('today');
  }

  function switchUser() {
    localStorage.removeItem(SELECTED_USER_KEY);
    setUser(null);
    setActiveTab('today');
  }

  if (!user) {
    return <UserPicker onSelect={handleSelect} adminPin={ADMIN_PIN} error={pinError} />;
  }

  let content;
  if (activeTab === 'today') {
    content = (
      <TodayCard
        job={todayJob}
        responses={todayResponses}
        user={user}
        workerTotals={workerTotals}
        onSaved={() => setToast('Saved')}
      />
    );
  } else if (activeTab === 'admin') {
    content = isAdmin ? (
      <AdminJobForm job={todayJob} selectedDate={today} onSaved={setToast} />
    ) : (
      <TodayCard
        job={todayJob}
        responses={todayResponses}
        user={user}
        workerTotals={workerTotals}
        onSaved={() => setToast('Saved')}
      />
    );
  } else if (activeTab === 'history') {
    content = (
      <HistoryList
        jobs={historyJobs}
        responses={responses}
        filter={historyFilter}
        setFilter={setHistoryFilter}
      />
    );
  } else {
    content = <Payroll responses={responses} jobs={jobs} user={user} isAdmin={isAdmin} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      isAdmin={isAdmin}
      switchUser={switchUser}
      dbMode={dbMode}
    >
      {toast ? (
        <div className="fixed left-1/2 top-20 z-30 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm font-black text-white shadow-board">
          {toast}
        </div>
      ) : null}
      {content}
    </Layout>
  );
}
