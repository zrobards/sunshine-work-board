# Sunshine Work Board

Mobile-first React + Vite web app for Sunshine Remodeling. Jim can post the daily work plan, Zach and Xander can respond, enter hours, and track pay. Payroll includes unpaid/paid totals and an audit log for payment status changes.

## Install

```bash
npm install
npm run dev
```

Open the local URL Vite prints. On a phone, use the same network URL Vite shows when running with `npm run dev -- --host`.

## Users and PIN

The home screen asks who is using the app:

- Jim: admin controls, protected by PIN
- Zach: worker view
- Xander: worker view

Default Jim PIN:

```text
1234
```

To change it, create `.env`:

```bash
VITE_ADMIN_PIN=your-new-pin
```

## Firebase live data

The app runs with a localStorage demo database when Firebase variables are missing. For shared live data across Jim, Zach, and Xander phones, create a Firebase project with Firestore, then add these variables to `.env` locally and to Vercel:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firestore collections used:

- `dailyJobs`
- `workerResponses`
- `paymentAudit`

Suggested simple Firestore rules for a private v1 app while testing:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, replace the simple user picker with real authentication before using stricter per-user rules.

## Data models

`DailyJob`

```js
{
  id,
  date,
  status,
  jobName,
  address,
  startTime,
  endTime,
  neededWorkers: { zach, xander, other },
  notes,
  createdBy,
  createdAt,
  updatedAt
}
```

`WorkerResponse`

```js
{
  id,
  jobId,
  date,
  workerName,
  availability,
  note,
  hoursWorked,
  startTime,
  endTime,
  workNotes,
  payRate: 25,
  dailyPay,
  paymentStatus,
  paidDate,
  paidBy,
  paymentNote,
  updatedAt
}
```

Every payment status change writes to `paymentAudit`.

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Set framework preset to `Vite`.
4. Add the Firebase environment variables and `VITE_ADMIN_PIN`.
5. Deploy.

## PWA

The app includes `public/manifest.webmanifest`, theme color, and app icons so it can be added to a phone home screen. Service worker offline caching is not enabled yet because shared work plans should prefer fresh live data.
