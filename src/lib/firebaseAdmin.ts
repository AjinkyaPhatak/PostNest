// firebase-admin is an optional runtime dependency; require dynamically so TypeScript
// doesn't fail when the package isn't installed in the environment.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const admin: any = (() => {
  try {
    return require("firebase-admin");
  } catch (e) {
    return null;
  }
})();

let app: any;

function initAdmin() {
  if (!admin) throw new Error("firebase-admin not available");
  if (admin.apps && admin.apps.length) {
    app = admin.app();
    return app;
  }

  // Expect service account JSON in FIREBASE_SERVICE_ACCOUNT env (stringified JSON)
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    const parsed = JSON.parse(serviceAccount);
    app = admin.initializeApp({ credential: admin.credential.cert(parsed) });
  } else {
    // Fallback to default application credentials
    app = admin.initializeApp();
  }

  return app;
}

export function getAdmin() {
  if (!app) return initAdmin();
  return app;
}

export async function verifyIdToken(idToken: string) {
  const a = getAdmin();
  return a.auth().verifyIdToken(idToken);
}
