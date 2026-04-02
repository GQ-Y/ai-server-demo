import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const ok = login(username, password);
    if (!ok) {
      setError('密码错误');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
            <Shield className="w-9 h-9" fill="currentColor" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold font-headline text-primary-container">统一AI安全质量风险治理数据处理中台</h1>
          <p className="text-sm text-on-surface-variant mt-2">请登录以继续</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 ambient-shadow space-y-5"
        >
          <div>
            <label htmlFor="login-user" className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              账号
            </label>
            <input
              id="login-user"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-background text-on-surface outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="login-pass" className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              密码
            </label>
            <input
              id="login-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-background text-on-surface outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
          </div>

          {error ? <p className="text-sm text-error">{error}</p> : null}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-colors shadow-md active:scale-[0.99]"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
