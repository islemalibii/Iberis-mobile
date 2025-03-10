import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue';
import SignupPage from '@/views/SignupPage.vue';
import VerificationPage from '@/views/VerificationPage.vue';
import ForgetPassword from '@/views/ForgetPassword.vue';
import CreatecompanyPage from '@/views/CreatecompanyPage.vue';
import veriftelephone from '@/views/veriftelephone.vue';
import ResetCheck from '@/views/ResetCheck.vue';
import Newpassword from '@/views/newpassword.vue';




const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/signup',
    component: SignupPage
  },
  {
  path: '/verify',
  component: VerificationPage
  },
  {
  path: '/reset',
  component:ForgetPassword
  },
  {
  path: '/veriftlph',
  component:veriftelephone
  },
  {
  path: '/reset/check', 
  component: ResetCheck,
  },
  {
  path: '/reset/check/new', 
  component: Newpassword,
  },
  {
    path: '/create-company',
    component:CreatecompanyPage
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router