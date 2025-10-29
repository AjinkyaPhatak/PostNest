"use client";

import { auth, provider } from "./firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";

export async function signInWithGoogle(): Promise<any | null> {
  try {
    const result = await signInWithPopup(auth, provider as GoogleAuthProvider);
    return result.user;
  } catch (err: any) {
    console.error("Popup sign-in failed, falling back to redirect:", err);
    try {
      // Fallback to redirect which works in constrained environments
      await signInWithRedirect(auth, provider as GoogleAuthProvider);
      // After redirect, the app will reload — the calling page should call getRedirectResult if needed.
      return null;
    } catch (e) {
      console.error("Redirect sign-in failed:", e);
      throw e;
    }
  }
}

export async function handleRedirectResult(): Promise<any | null> {
  try {
    const res = await getRedirectResult(auth as any);
    return res?.user ?? null;
  } catch (err) {
    console.error("Error resolving redirect result:", err);
    return null;
  }
}
