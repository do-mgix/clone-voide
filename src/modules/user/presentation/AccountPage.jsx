import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { initCommonPage } from '../../../app/pages/common.js';
import { initAccountPage } from './account-page.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';
import {
  buildAccountPageHref,
  HOME_PAGE_PATH,
  GOOGLE_LOGIN_PAGE_PATH,
} from '../../../shared/presentation/page-paths.js';
import { showToast } from '../../../shared/ui/toast.js';
import { authenticationService } from '../application/authentication-service.js';
import { apiClient } from '../../../shared/api/client.js';
import { auth } from '../infrastructure/firebase-config.js';

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({ displayName: '', email: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    initCommonPage();
    initAccountPage();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        window.location.href = GOOGLE_LOGIN_PAGE_PATH;
        return;
      }
      fetchProfile();
      unsubscribe();
    });

    return () => unsubscribe();
  }, []);

  async function fetchProfile() {
    setIsProfileLoading(true);
    try {
      const response = await apiClient.get('/auth/me');
      const user = response.data?.user ?? null;
      setProfile(user);
      setProfileForm({
        displayName: user?.displayName ?? '',
        email: user?.email ?? '',
      });
    } catch (error) {
      console.error('Failed to load profile', error);
      showToast('Não foi possível carregar seus dados.');
    } finally {
      setIsProfileLoading(false);
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    const name = profileForm.displayName.trim();
    if (!name) {
      showToast('O nome não pode estar em branco.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const response = await apiClient.patch('/auth/me', { displayName: name });
      const updated = response.data?.user ?? null;
      setProfile((prev) => ({ ...prev, displayName: updated?.displayName ?? prev?.displayName }));
      showToast('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Failed to save profile', error);
      showToast('Não foi possível salvar as alterações.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await authenticationService.logout();
      showToast('Você saiu da conta.');
      window.location.href = HOME_PAGE_PATH;
    } catch (error) {
      console.error('Logout failed', error);
      showToast('Não foi possível sair agora.');
      setIsLoggingOut(false);
    }
  }

  const displayName = profile?.displayName || profile?.email?.split('@')[0] || 'Visitante';
  const displayEmail = profile?.email ?? '—';
  const memberSince = profile?.createdAt
    ? `✦ Cliente desde ${new Date(profile.createdAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })}`
    : null;

  return (
    <SiteLayout activeNav="account">
      <div className="user-page">
        <div className="user-cover"></div>
        <div className="user-profile-row">
          <div className="user-avatar" aria-label="foto de perfil">
            <span className="user-avatar-mascot">0o</span>
          </div>
          <div className="user-profile-info">
            <div className="user-name">{isProfileLoading ? 'Carregando…' : displayName}</div>
            <div className="user-email">{isProfileLoading ? '—' : displayEmail}</div>
            {!isProfileLoading && memberSince && (
              <div className="user-since">{memberSince}</div>
            )}
          </div>
        </div>
        <div className="user-layout">
          <aside className="user-sidebar">
            <ul className="user-sidebar-nav">
              <li>
                <a href={buildAccountPageHref({ section: 'overview' })} className="active" data-section="overview">
                  Visão geral
                </a>
              </li>
              <li>
                <a href={buildAccountPageHref({ section: 'orders' })} data-section="orders">
                  Pedidos
                </a>
              </li>
              <li>
                <a href={buildAccountPageHref({ section: 'wishlist' })} data-section="wishlist">
                  Favoritos
                </a>
              </li>
              <li>
                <a href={buildAccountPageHref({ section: 'addresses' })} data-section="addresses">
                  Endereços
                </a>
              </li>
              <li>
                <a href={buildAccountPageHref({ section: 'profile' })} data-section="profile">
                  Perfil
                </a>
              </li>
              <div className="user-sidebar-divider"></div>
              <li>
                <button
                  className="user-logout-btn"
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Saindo…' : 'Sair'}
                </button>
              </li>
            </ul>
          </aside>
          <main className="user-content">

            {/* ── Overview ───────────────────────────────── */}
            <div id="section-overview">
              <div className="user-stats-row">
                <div className="user-stat-card">
                  <div className="user-stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  </div>
                  <div>
                    <div className="user-stat-num">0</div>
                    <div className="user-stat-label">Pedidos</div>
                  </div>
                </div>
                <div className="user-stat-card">
                  <div className="user-stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div>
                    <div className="user-stat-num">0</div>
                    <div className="user-stat-label">Favoritos</div>
                  </div>
                </div>
                <div className="user-stat-card">
                  <div className="user-stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div>
                    <div className="user-stat-num">0</div>
                    <div className="user-stat-label">Avaliações</div>
                  </div>
                </div>
              </div>
              <div className="user-section">
                <div className="user-section-header">
                  <div className="user-section-title">Pedidos recentes</div>
                </div>
                <div className="user-empty-state">
                  <span className="user-empty-icon">📦</span>
                  <p>Você ainda não fez nenhum pedido.</p>
                </div>
              </div>
            </div>

            {/* ── Orders ─────────────────────────────────── */}
            <div id="section-orders" style={{ display: 'none' }}>
              <div className="user-section">
                <div className="user-section-title">Pedidos</div>
                <div className="user-empty-state">
                  <span className="user-empty-icon">📦</span>
                  <p>Você ainda não fez nenhum pedido.</p>
                </div>
              </div>
            </div>

            {/* ── Wishlist ────────────────────────────────── */}
            <div id="section-wishlist" style={{ display: 'none' }}>
              <div className="user-section">
                <div className="user-section-header">
                  <div className="user-section-title">Favoritos</div>
                </div>
                <div className="user-empty-state">
                  <span className="user-empty-icon">❤️</span>
                  <p>Nenhum produto favoritado ainda.</p>
                </div>
              </div>
            </div>

            {/* ── Addresses ──────────────────────────────── */}
            <div id="section-addresses" style={{ display: 'none' }}>
              <div className="user-section">
                <div className="user-section-header">
                  <div className="user-section-title">Endereços</div>
                </div>
                <div className="address-grid">
                  <div className="address-add">
                    <div className="address-add-icon">＋</div>
                    <span>Adicionar endereço</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Profile ────────────────────────────────── */}
            <div id="section-profile" style={{ display: 'none' }}>
              <div className="user-section">
                <div className="user-section-header">
                  <div className="user-section-title">Informações pessoais</div>
                </div>
                <form className="user-form" onSubmit={handleSaveProfile}>
                  <div className="user-form-group">
                    <label className="user-form-label">Nome</label>
                    <input
                      className="user-form-input"
                      type="text"
                      value={profileForm.displayName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))
                      }
                      placeholder="Seu nome"
                      maxLength={80}
                      disabled={isProfileLoading}
                    />
                  </div>
                  <div className="user-form-group">
                    <label className="user-form-label">Email</label>
                    <input
                      className="user-form-input"
                      type="email"
                      value={profileForm.email}
                      readOnly
                      disabled
                      title="O email não pode ser alterado aqui."
                    />
                  </div>
                  <div className="user-form-group full user-form-actions">
                    <button
                      className="btn-primary"
                      type="submit"
                      disabled={isSavingProfile || isProfileLoading}
                    >
                      {isSavingProfile ? 'Salvando…' : 'Salvar alterações'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </main>
        </div>
      </div>
    </SiteLayout>
  );
}
