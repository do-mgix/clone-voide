import { useEffect, useState } from 'react';
import { initCommonPage } from '../../../app/pages/common.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';
import { ACCOUNT_PAGE_PATH, REGISTER_PAGE_PATH } from '../../../shared/presentation/page-paths.js';
import { showToast } from '../../../shared/ui/toast.js';
import { authenticationService } from '../application/authentication-service.js';
import { getAuthState, subscribeAuthState } from '../application/auth-state.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLabel, setStatusLabel] = useState(() => {
    const state = getAuthState();
    return state?.isAuthenticated ? `Conectado como ${state.email}` : 'Você ainda não está conectado.';
  });
  const [mode, setMode] = useState('login');
  const isRegistering = mode === 'register';

  useEffect(() => {
    initCommonPage();
    const unsubscribe = subscribeAuthState((state) => {
      setStatusLabel(state?.isAuthenticated ? `Conectado como ${state.email}` : 'Você ainda não está conectado.');
    });
    return unsubscribe;
  }, []);

  function validate() {
    const validation = {};

    if (!form.email) {
      validation.email = 'Informe o email cadastrado.';
    } else if (!EMAIL_PATTERN.test(form.email)) {
      validation.email = 'Endereço de email inválido.';
    }

    if (!form.password) {
      validation.password = 'Informe a senha.';
    }

    if (isRegistering) {
      if (!form.confirmPassword) {
        validation.confirmPassword = 'Confirme a senha.';
      } else if (form.confirmPassword !== form.password) {
        validation.confirmPassword = 'As senhas não coincidem.';
      }
    }

    return validation;
  }

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length) {
      const firstError = Object.values(validation)[0];
      showToast(firstError);
      return;
    }

    try {
      setIsSubmitting(true);
      const action = isRegistering ? authenticationService.register : authenticationService.login;
      await action(form);
      showToast(isRegistering ? 'Conta criada com sucesso!' : 'Login efetuado com sucesso!');
      window.location.href = ACCOUNT_PAGE_PATH;
    } catch (error) {
      const msg = error?.type === 'AUTH_ERROR'
        ? error.message
        : isRegistering
          ? 'Não foi possível cadastrar. Tente novamente.'
          : 'Não foi possível conectar. Tente novamente.';
      setServerError(msg);
      showToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setErrors({});
    setServerError('');
    setForm({ email: '', password: '', confirmPassword: '' });
  }

  return (
    <SiteLayout activeNav="login">
      <section className="login-page">
        <div className="login-panel">
          <div className="login-panel-header">
            <p className="login-status">{statusLabel}</p>
            <h1>{isRegistering ? 'Criar conta' : 'Entrar na Conta'}</h1>
            <p className="login-subtitle">
              {isRegistering
                ? 'Cadastre-se para acessar suas listas e pedidos.'
                : 'Acesse suas listas, pedidos e preferências personalizadas.'}
            </p>
          </div>
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-label">
              Email
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="seu@email.com"
                className={`login-input${errors.email ? ' invalid' : ''}`}
                autoComplete="email"
              />
              {errors.email && <span className="login-error">{errors.email}</span>}
            </label>
            <label className="login-label">
              Senha
              <input
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                className={`login-input${errors.password ? ' invalid' : ''}`}
                autoComplete="current-password"
              />
              {errors.password && <span className="login-error">{errors.password}</span>}
            </label>
            {isRegistering && (
              <label className="login-label">
                Repita a senha
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="••••••••"
                  className={`login-input${errors.confirmPassword ? ' invalid' : ''}`}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="login-error">{errors.confirmPassword}</span>}
              </label>
            )}
            {serverError && <p className="login-error login-error--server">{serverError}</p>}
            <button
              className="btn-primary login-submit login-submit--email"
              type="submit"
              disabled={isSubmitting}
              onClick={() => console.log('Login button clicked', { mode })}
            >
              {isSubmitting ? 'Entrando…' : isRegistering ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>
          {!isRegistering && (
            <a className="login-register-link" href={REGISTER_PAGE_PATH}>
              Não possui conta? Cadastre-se
            </a>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
