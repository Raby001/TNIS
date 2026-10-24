import MainLayout from '@/layouts/MainLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import MapPage from '@/pages/MapPage.vue'
import AssetPage from '@/pages/AssetPage.vue'
import SitePage from '@/pages/SitePage.vue'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'
import UsersRolesPage from '@/pages/UsersRolesPage.vue'
import SystemLogsPage from '@/pages/SystemLogsPage.vue'
import ReportGeneratePage from '@/pages/ReportGeneratePage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import { ROUTE_PERMISSIONS, canAccessRoute } from '@/constants/route-permissions'
import ProfileSettingPage from '@/pages/ProfileSettingPage.vue'
import UserSettingPage from '@/pages/UserSettingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/app',
    },

    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { public: true }
    },

    {
      path: '/app',
      component: MainLayout,

      children: [
        {
          path: 'profile',
          name: 'profile',
          component: ProfileSettingPage,
        },
        {
          path: 'settings',
          name: 'settings',
          component: UserSettingPage,
        },
        {
          path: '',
          name: 'dashboard',
          component: DashboardPage,
        },
        {
          path: 'map',
          name: 'map',
          component: MapPage,
        },
        {
          path: 'data-management',
          name: 'data-management',
          redirect: { name: 'manage-asset' },
        },
        {
          path: 'data-management/assets',
          name: 'manage-asset',
          component: AssetPage,
        },
        {
          path: 'data-management/sites',
          name: 'manage-site',
          component: SitePage,
        },
        {
          path: 'users-roles',
          component: UsersRolesPage,
          meta: { permission: ROUTE_PERMISSIONS['/app/users-roles'] },
        },
        {
          path: 'system-logs',
          component: SystemLogsPage,
          meta: { permission: ROUTE_PERMISSIONS['/app/system-logs'] },
        },
        {
          path: 'report-generation',
          component: ReportGeneratePage,
        },
        {
          path: 'system-settings',
          component: SettingsPage,
          meta: { permission: ROUTE_PERMISSIONS['/app/system-settings'] },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.user && auth.token) {
    await auth.restoreSession()
  }

  const isPublic = to.meta.public === true

  if (isPublic) {
    if (auth.isAuthenticated && to.path === '/login') {
      return { path: '/app' }
    }
    return true
  }

  if (!auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (!canAccessRoute(to.path, auth)) {
    return { path: '/app' }
  }

  return true
})

export default router
