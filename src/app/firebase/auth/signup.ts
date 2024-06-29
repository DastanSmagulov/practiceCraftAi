import firebase_app from "../config";
import {
  createUserWithEmailAndPassword,
  getAuth,
  UserCredential,
} from "firebase/auth";

const auth = getAuth(firebase_app);

interface SignUpResult {
  result: UserCredential | null;
  error: Error | null;
}

export default async function signUp(
  email: string,
  password: string
): Promise<SignUpResult> {
  let result: UserCredential | null = null;
  let error: Error | null = null;

  try {
    result = await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    error = e as Error;
  }

  return { result, error };
}
