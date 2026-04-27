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
import { useAuthStore } from '../stores/auth'

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
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  // The store is bootstrapped synchronously in main.js, so by the time the
  // guard runs we're never in 'unknown' here. (If that changes, gate on it.)
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
