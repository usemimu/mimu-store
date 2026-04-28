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
import OnboardingShell from '../views/onboarding/OnboardingShell.vue'
import SetPasswordStep from '../views/onboarding/SetPasswordStep.vue'
import ProfileStep from '../views/onboarding/ProfileStep.vue'
import BankStep from '../views/onboarding/BankStep.vue'
import DoneStep from '../views/onboarding/DoneStep.vue'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'splash', component: SplashView },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/signup', name: 'signup', component: SignupView, meta: { guestOnly: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guestOnly: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/earnings', name: 'earnings', component: EarningsView, meta: { requiresAuth: true } },
    { path: '/screen', name: 'screen', component: MyScreenView, meta: { requiresAuth: true } },
    { path: '/referrals', name: 'referrals', component: ReferralsView, meta: { requiresAuth: true } },
    { path: '/account', name: 'account', component: AccountView, meta: { requiresAuth: true } },
    { path: '/account/edit-business', name: 'edit-business', component: EditBusinessView, meta: { requiresAuth: true } },
    { path: '/account/change-password', name: 'change-password', component: ChangePasswordView, meta: { requiresAuth: true } },
    { path: '/account/notifications', name: 'notifications', component: NotificationsView, meta: { requiresAuth: true } },
    // Onboarding wizard. Each child is its own URL so back-button +
    // resume-from-link work. `meta.onboarding` is read by the route
    // guard so we don't bounce these to the dashboard when the profile
    // is incomplete.
    {
      path: '/onboarding',
      component: OnboardingShell,
      meta: { requiresAuth: true, onboarding: true },
      children: [
        { path: '', redirect: '/onboarding/password' },
        { path: 'password', name: 'onboarding-password', component: SetPasswordStep },
        { path: 'profile', name: 'onboarding-profile', component: ProfileStep },
        { path: 'bank', name: 'onboarding-bank', component: BankStep },
        { path: 'done', name: 'onboarding-done', component: DoneStep },
      ],
    },
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

  // Onboarding gate. The auth-store bootstrap merges /profile into the
  // user record but doesn't fetch completion-status — we read that from
  // the profile store. If the host is signed-in but not yet complete,
  // park them on the onboarding flow. Onboarding routes bypass this
  // check (otherwise we'd loop) and so do plain auth pages.
  if (auth.isAuthenticated && to.meta.requiresAuth && !to.meta.onboarding) {
    const profile = useProfileStore()
    // `completion === null` means we haven't probed yet; lean
    // permissive (let the navigation through) and the dashboard will
    // render its empty states. The Account page kicks off `profile.load()`
    // and on next nav we'll know.
    if (profile.completion && profile.completion.isComplete === false) {
      return { name: 'onboarding-profile' }
    }
  }
})

export default router
