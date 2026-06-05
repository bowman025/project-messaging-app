import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <header className="auth-page-header">
        <div className="auth-header-inner">Blabber</div>
        <div className="auth-header-inner-sub">Keep on blabbing</div>
      </header>

      <main className="auth-page-main">
        <Outlet />
      </main>

      <footer className="auth-page-footer">
        <div className="auth-footer-inner">
          Made by <a href="https://github.com/bowman025">bowman025</a>.
        </div>
      </footer>
    </div>
  );
}
