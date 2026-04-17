import { useEffect, useState } from 'react';
import { initCommonPage } from '../../../app/pages/common.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';
import { ACCOUNT_PAGE_PATH, LOGIN_PAGE_PATH } from '../../../shared/presentation/page-paths.js';
import { showToast } from '../../../shared/ui/toast.js';
import { authenticationService } from '../application/authentication-service.js';
import { getAuthState, subscribeAuthState } from '../application/auth-state.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    initCommonPage();

    const state = getAuthState();
    if (state?.isAuthenticated) {
      window.location.href = ACCOUNT_PAGE_PATH;
    }

    const unsubscribe = subscribeAuthState((state) => {
      if (state?.isAuthenticated) {
        window.location.href = ACCOUNT_PAGE_PATH;
      }
    });

    return unsubscribe;
  }, []);

  function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  }

  function handlePasswordChange(event) {
    const password = event.target.value;
    setForm((prev) => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
  }

  function handleChange(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    };
  }

  function validate() {
    const validation = {};

    if (!form.email.trim()) {
      validation.email = 'Email é obrigatório.';
    } else if (!EMAIL_PATTERN.test(form.email)) {
      validation.email = 'Endereço de email inválido.';
    }

    if (!form.password) {
      validation.password = 'Senha é obrigatória.';
    } else if (form.password.length < PASSWORD_MIN_LENGTH) {
      validation.password = `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    }

    if (!form.confirmPassword) {
      validation.confirmPassword = 'Confirme a senha.';
    } else if (form.confirmPassword !== form.password) {
      validation.confirmPassword = 'As senhas não coincidem.';
    }

    return validation;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      const firstError = Object.values(validation)[0];
      showToast(firstError);
      return;
    }

    try {
      setIsSubmitting(true);
      await authenticationService.register({
        email: form.email.trim(),
        password: form.password,
      });
      showToast('Conta criada com sucesso!');
      window.location.href = ACCOUNT_PAGE_PATH;
    } catch (error) {
      console.error('Registration error:', error);
      const status = error?.response?.status;
      let errorMessage = 'Não foi possível criar a conta. Tente novamente.';

      if (status === 400) {
        const detail = error?.response?.data?.message;
        if (detail?.includes('already')) {
          errorMessage = 'Este email já está cadastrado.';
        } else if (detail) {
          errorMessage = detail;
        }
      } else if (status === 409) {
        errorMessage = 'Este email já está cadastrado.';
      }

      setServerError(errorMessage);
      showToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const getPasswordStrengthLabel = () => {
    const labels = ['Muito fraca', 'Fraca', 'Normal', 'Boa', 'Forte', 'Muito forte'];
    return labels[passwordStrength];
  };

  const getPasswordStrengthColor = () => {
    const colors = ['#dc2626', '#f97316', '#eab308', '#84cc16', '#22c55e', '#16a34a'];
    return colors[passwordStrength];
  };

  return (
    <SiteLayout activeNav="register" peekNav>
      <section className="register-page login-page">
        <div className="register-wrapper">
          <div className="register-panel login-panel">
            <div className="register-panel-header login-panel-header">
              <h1>Criar conta</h1>
              <p className="register-subtitle login-subtitle">
                Cadastre-se para acessar suas listas e pedidos.
              </p>
              <p className="register-login-link">
                Já tem uma conta?{' '}
                <a href={LOGIN_PAGE_PATH}>Faça login</a>
              </p>
            </div>

            <form className="register-form login-form" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <label className="register-label login-label">
                <span className="register-field-label">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="seu@email.com"
                  className={`register-input login-input${errors.email ? ' invalid' : ''}`}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="register-error">{errors.email}</span>
                )}
              </label>

              {/* Password */}
              <label className="register-label login-label">
                <span className="register-field-label">Senha</span>
                <div className="register-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={`register-input login-input${errors.password ? ' invalid' : ''}`}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {form.password && (
                  <div className="password-strength">
                    <div className="password-strength-bar">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          style={{ background: i < passwordStrength ? getPasswordStrengthColor() : undefined }}
                        />
                      ))}
                    </div>
                    <span className="password-strength-label">{getPasswordStrengthLabel()}</span>
                  </div>
                )}

                {errors.password && (
                  <span className="register-error">{errors.password}</span>
                )}
              </label>

              {/* Confirm Password */}
              <label className="register-label login-label">
                <span className="register-field-label">Confirmar senha</span>
                <div className="register-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder="••••••••"
                    className={`register-input login-input${errors.confirmPassword ? ' invalid' : ''}`}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="toggle-password"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {form.confirmPassword && form.confirmPassword === form.password && !errors.confirmPassword && (
                  <span className="password-match">✓ Senhas conferem</span>
                )}

                {errors.confirmPassword && (
                  <span className="register-error">{errors.confirmPassword}</span>
                )}
              </label>

              {serverError && (
                <div className="register-error--server">{serverError}</div>
              )}

              <button
                className="btn-primary login-submit register-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
              </button>

              <p className="register-terms">
                Ao se cadastrar, você concorda com nossos{' '}
                <a href="#">termos de serviço</a>
                {' '}e{' '}
                <a href="#">política de privacidade</a>.
              </p>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
