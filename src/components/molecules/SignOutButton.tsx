import { signOut } from 'next-auth/client';

export default function SignOutButton() {
  return <button onClick={() => signOut()}>Sign Out</button>;
}
