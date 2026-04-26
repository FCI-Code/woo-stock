import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar — WooStock',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <LoginForm />
    </main>
  );
}
