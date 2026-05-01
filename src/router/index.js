import { createRouter, createWebHistory } from 'vue-router'
import SplashView from '../views/SplashView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import DashboardView from '../views/DashboardView.vue'
import EarningsView from '../views/EarningsView.vue'
import MyScreenView from '../views/MyScreenView.vue'
import ReferralsView from '../views/ReferralsView.vue'
import AccountView from '../views/AccountView.vue'
import EditBusinessView from '../views/EditBusinessView.vue'
import ChangePasswordView from '../views/ChangePasswordView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import SetPasswordStep from '../views/onboarding/SetPasswordStep.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'splash', component: SplashView },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    // The backend sends invite links as `${HOST_APP_URL}/onboard?invite=...`
    // (see host-invites.service.ts). `/onboard` is aliased to `/signup`
    // so the WhatsApp / SMS / email link lands on the claim form
    // without a 404, and SignupView's `?invite=` query prefill takes
    // it from there. Alias rather than redirect so the URL the host
    // sees matches what they clicked — no surprise jump to /signup.
    {
      path: '/signup',
      alias: '/onboard',
      name: 'signup',
      component: SignupView,
      meta: { guestOnly: true },
    },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guestOnly: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/earnings', name: 'earnings', component: EarningsView, meta: { requiresAuth: true } },
    { path: '/screen', name: 'screen', component: MyScreenView, meta: { requiresAuth: true } },
    { path: '/referrals', name: 'referrals', component: ReferralsView, meta: { requiresAuth: true } },
    { path: '/account', name: 'account', component: AccountView, meta: { requiresAuth: true } },
    { path: '/account/edit-business', name: 'edit-business', component: EditBusinessView, meta: { requiresAuth: true } },
    { path: '/account/change-password', name: 'change-password', component: ChangePasswordView, meta: { requiresAuth: true } },
    { path: '/account/notifications', name: 'notifications', component: NotificationsView, meta: { requiresAuth: true } },
    // Onboarding is a single step: set a password. After that the
    // host lands on the dashboard. Business details / bank details
    // are not part of the wizard — admins pre-fill business info at
    // invite time, and the host can edit it via Account → Edit
    // business / bank flows whenever they're ready.
    {
      path: '/onboarding/password',
      name: 'onboarding-password',
      component: SetPasswordStep,
      meta: { requiresAuth: true, onboarding: true },
    },
    // Backwards-compat: any old `/onboarding/...` deep link (from a
    // previous build's wizard) lands on the password step.
    { path: '/onboarding', redirect: '/onboarding/password' },
    { path: '/onboarding/:rest(.*)*', redirect: '/onboarding/password' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  // Bootstrap probes /profile asynchronously. While the probe is in
  // flight (`status === 'unknown'`), park the user on the splash so we
  // don't flash the login screen for a legitimate session — or, worse,
  // wave a stale-token user into the dashboard.
  if (auth.status === 'unknown') {
    if (to.name !== 'splash') return { name: 'splash' }
    return
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
  // No completion-status gate. Hosts go straight to the dashboard
  // after sign-in; if they want to fill in bank or fix business
  // details they do it from Account.
})

export default router
