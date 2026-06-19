import { todayKey } from './dateUtils';

const LOCAL_JOBS_KEY = 'sunshine.jobs.v1';
const LOCAL_RESPONSES_KEY = 'sunshine.responses.v1';
const LOCAL_AUDIT_KEY = 'sunshine.paymentAudit.v1';

let firebaseDb;
let firestoreApi;
let usingFirebase = false;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function hasFirebaseConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

export async function initDb() {
  if (!hasFirebaseConfig()) return { mode: 'local' };

  const [{ initializeApp }, firestore] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
  ]);

  const app = initializeApp(firebaseConfig);
  firebaseDb = firestore.getFirestore(app);
  firestoreApi = firestore;
  usingFirebase = true;
  return { mode: 'firebase' };
}

function readLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('sunshine-storage-change'));
}

function nowIso() {
  return new Date().toISOString();
}

export function blankJob(date = todayKey()) {
  return {
    id: date,
    date,
    status: 'Maybe',
    jobName: '',
    address: '',
    startTime: '',
    endTime: '',
    neededWorkers: {
      zach: true,
      xander: true,
      other: '',
    },
    notes: '',
    createdBy: 'Jim Hisle',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export function blankResponse(jobId, date, workerName) {
  return {
    id: `${date}-${workerName.toLowerCase()}`,
    jobId,
    date,
    workerName,
    availability: 'Not answered',
    note: '',
    hoursWorked: 0,
    startTime: '',
    endTime: '',
    workNotes: '',
    payRate: 25,
    dailyPay: 0,
    paymentStatus: 'Unpaid',
    paidDate: '',
    paidBy: '',
    paymentNote: '',
    updatedAt: nowIso(),
  };
}

export function subscribeBoard(onChange) {
  if (usingFirebase) {
    const { collection, onSnapshot, orderBy, query } = firestoreApi;
    const jobsQuery = query(collection(firebaseDb, 'dailyJobs'), orderBy('date', 'desc'));
    const responsesQuery = query(collection(firebaseDb, 'workerResponses'), orderBy('date', 'desc'));
    const auditQuery = query(collection(firebaseDb, 'paymentAudit'), orderBy('timestamp', 'desc'));
    let jobs = [];
    let responses = [];
    let auditLog = [];

    const emit = () => onChange({ jobs, responses, auditLog, mode: 'firebase' });
    const unsubs = [
      onSnapshot(jobsQuery, (snapshot) => {
        jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        emit();
      }),
      onSnapshot(responsesQuery, (snapshot) => {
        responses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        emit();
      }),
      onSnapshot(auditQuery, (snapshot) => {
        auditLog = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        emit();
      }),
    ];
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }

  const emitLocal = () => onChange({
    jobs: readLocal(LOCAL_JOBS_KEY, []),
    responses: readLocal(LOCAL_RESPONSES_KEY, []),
    auditLog: readLocal(LOCAL_AUDIT_KEY, []),
    mode: 'local',
  });
  emitLocal();
  window.addEventListener('sunshine-storage-change', emitLocal);
  window.addEventListener('storage', emitLocal);
  return () => {
    window.removeEventListener('sunshine-storage-change', emitLocal);
    window.removeEventListener('storage', emitLocal);
  };
}

export async function saveJob(job) {
  const stamp = nowIso();
  const payload = {
    ...job,
    id: job.date,
    createdAt: job.createdAt || stamp,
    updatedAt: stamp,
  };

  if (usingFirebase) {
    const { doc, serverTimestamp, setDoc } = firestoreApi;
    await setDoc(doc(firebaseDb, 'dailyJobs', payload.id), {
      ...payload,
      updatedAt: serverTimestamp(),
      createdAt: payload.createdAt,
    }, { merge: true });
    return payload;
  }

  const jobs = readLocal(LOCAL_JOBS_KEY, []);
  const next = [payload, ...jobs.filter((item) => item.id !== payload.id)]
    .sort((a, b) => b.date.localeCompare(a.date));
  writeLocal(LOCAL_JOBS_KEY, next);
  return payload;
}

export async function clearJob(date) {
  if (usingFirebase) {
    const { deleteDoc, doc } = firestoreApi;
    await deleteDoc(doc(firebaseDb, 'dailyJobs', date));
    return;
  }
  writeLocal(LOCAL_JOBS_KEY, readLocal(LOCAL_JOBS_KEY, []).filter((job) => job.date !== date));
}

export async function saveWorkerResponse(response) {
  const hoursWorked = Number(response.hoursWorked || 0);
  const payload = {
    ...response,
    id: response.id || `${response.date}-${response.workerName.toLowerCase()}`,
    jobId: response.jobId || response.date,
    payRate: 25,
    hoursWorked,
    dailyPay: Number((hoursWorked * 25).toFixed(2)),
    paymentStatus: response.paymentStatus || 'Unpaid',
    updatedAt: nowIso(),
  };

  if (usingFirebase) {
    const { doc, serverTimestamp, setDoc } = firestoreApi;
    await setDoc(doc(firebaseDb, 'workerResponses', payload.id), {
      ...payload,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return payload;
  }

  const responses = readLocal(LOCAL_RESPONSES_KEY, []);
  writeLocal(LOCAL_RESPONSES_KEY, [
    payload,
    ...responses.filter((item) => item.id !== payload.id),
  ].sort((a, b) => b.date.localeCompare(a.date)));
  return payload;
}

export async function updatePayment(response, status, { changedBy = 'Jim Hisle', note = '', amountPaid } = {}) {
  const paidNow = status === 'Paid';
  const updated = {
    ...response,
    paymentStatus: status,
    paidDate: paidNow ? todayKey() : '',
    paidBy: paidNow ? changedBy : '',
    paymentNote: note,
    dailyPay: Number(response.dailyPay || Number(response.hoursWorked || 0) * 25),
  };
  if (typeof amountPaid === 'number') {
    updated.dailyPay = amountPaid;
  }
  await saveWorkerResponse(updated);
  await addPaymentAudit({
    workerName: response.workerName,
    date: response.date,
    action: status === 'Paid' ? 'Marked Paid' : status === 'Needs Review' ? 'Needs Review' : 'Marked Unpaid',
    amount: updated.dailyPay,
    changedBy,
    note,
  });
  return updated;
}

export async function addPaymentAudit(entry) {
  const id = `${entry.workerName}-${entry.date}-${Date.now()}`;
  const payload = {
    id,
    ...entry,
    timestamp: nowIso(),
  };

  if (usingFirebase) {
    const { doc, serverTimestamp, setDoc } = firestoreApi;
    await setDoc(doc(firebaseDb, 'paymentAudit', id), {
      ...payload,
      timestamp: serverTimestamp(),
    });
    return payload;
  }

  writeLocal(LOCAL_AUDIT_KEY, [payload, ...readLocal(LOCAL_AUDIT_KEY, [])]);
  return payload;
}
