import { useEffect, useState } from 'react';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';
import { buildAccountPageHref, GOOGLE_LOGIN_PAGE_PATH } from '../../../shared/presentation/page-paths.js';
import { showToast } from '../../../shared/ui/toast.js';

export default function CompleteProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    const pending = window.sessionStorage.getItem('pendingGoogleProfile');
    if (!pending) {
      window.location.href = GOOGLE_LOGIN_PAGE_PATH;
      return;
    }
    const parsed = JSON.parse(pending);
    setProfile(parsed);
    setForm((prev) => ({ ...prev, name: parsed.displayName ?? '', email: parsed.email }));
  }, []);

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    showToast('Informações salvas! Em breve retornará para sua conta.');
    window.sessionStorage.removeItem('pendingGoogleProfile');
    window.setTimeout(() => {
      window.location.href = buildAccountPageHref();
    }, 1200);
  }

  if (!profile) {
    return null;
  }

  return (
    <SiteLayout activeNav="account" peekNav>
      <section className="login-page login-page--complete-profile">
        <div className="login-panel">
          <h1>Complete seu cadastro</h1>
          <p>Estamos quase lá! Confirme seus dados abaixo para finalizar.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-label">
              Nome completo
              <input type="text" value={form.name} onChange={handleChange('name')} required />
            </label>
            <label className="login-label">
              Telefone
              <input type="tel" value={form.phone} onChange={handleChange('phone')} required />
            </label>
            <label className="login-label">
              Endereço
              <input type="text" value={form.address} onChange={handleChange('address')} required />
            </label>
            <button className="btn-primary login-submit" type="submit">
              Continuar para minha conta
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
