import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import RouterAuth from './router-auth';
import Login from '@/components/login/Login.vue';
import ResetPassword from '@/components/login/ResetPassword.vue';
import ForgotPassword from '@/components/login/ForgotPassword.vue';
import Dashboard from '@/views/Dashboard.vue';
import Company from '@/components/Company.vue';
import Branch from '@/components/Branch.vue';
import User from '@/components/User.vue';
import Assets from '@/components/Assets.vue';
import NotFound from '@/components/NotFound.vue';
import ScanEntry from '@/components/ScanEntry.vue';

Vue.use(VueRouter);

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return (originalPush as any).call(this, location).catch((error) => error);
};

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/resetPassword',
    name: 'ResetPassword',
    component: ResetPassword,
  },
  {
    path: '/forgotPassword',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/companies',
    name: 'companies',
    component: Company,
    meta: {
      requiresAuth: true,
      requiresSuperAdminAuth: true,
    },
  },
  {
    path: '/locations',
    name: 'locations',
    component: Branch,
    meta: {
      requiresAuth: true,
      requiresCompanyAdminAuth: true,
    },
  },
  {
    path: '/users',
    name: 'users',
    component: User,
    meta: {
      requiresAuth: true,
      requiresCompanyAdminAuth: true,
    },
  },
  {
    path: '/assets',
    name: 'assets',
    component: Assets,
    meta: {
      requiresAuth: true,
      requiresCompanyAdminAuth: true,
    },
  },
  {
    path: '/scanEntries',
    name: 'scanEntries',
    component: ScanEntry,
    meta: {
      requiresAuth: true,
      requiresCompanyAdminAuth: true,
    },
  },
  {
    path: '*',
    name: 'notFound',
    component: NotFound,
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to: any, from: any, next: any) => {
  RouterAuth.BeforeEach(to, from, next);
});

export default router;
