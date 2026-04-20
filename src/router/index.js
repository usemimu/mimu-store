import { createRouter, createWebHistory } from 'vue-router'
import SplashView from '../views/SplashView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import EarningsView from '../views/EarningsView.vue'
import MyScreenView from '../views/MyScreenView.vue'
import ReferralsView from '../views/ReferralsView.vue'
import AccountView from '../views/AccountView.vue'
import EditBusinessView from '../views/EditBusinessView.vue'
import ChangePasswordView from '../views/ChangePasswordView.vue'
import NotificationsView from '../views/NotificationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'splash',
      component: SplashView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/earnings',
      name: 'earnings',
      component: EarningsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/screen',
      name: 'screen',
      component: MyScreenView,
      meta: { requiresAuth: true }
    },
    {
      path: '/referrals',
      name: 'referrals',
      component: ReferralsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      meta: { requiresAuth: true }
    },
    {
      path: '/account/edit-business',
      name: 'edit-business',
      component: EditBusinessView,
      meta: { requiresAuth: true }
    },
    {
      path: '/account/change-password',
      name: 'change-password',
      component: ChangePasswordView,
      meta: { requiresAuth: true }
    },
    {
      path: '/account/notifications',
      name: 'notifications',
      component: NotificationsView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('mimu-authenticated') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/signup') && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
