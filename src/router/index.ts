import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue';
import SignupPage from '@/views/SignupPage.vue';
import VerificationPage from '@/views/VerificationPage.vue';
import ForgetPassword from '@/views/ForgetPassword.vue';
import CreatecompanyPage from '@/views/CreatecompanyPage.vue';
import Veriftelephone from '@/views/Veriftelephone.vue';
import ResetCheck from '@/views/ResetCheck.vue';
import Newpassword from '@/views/Newpassword.vue';
import InvoicesPage from '@/views/InvoicesPage.vue';
import CreateinvoicePage from '@/views/CreateinvoicePage.vue';
import tajrouba from  '@/views/tajrouba.vue'
import ModifyinvoicePage from '@/views/ModifyinvoicePage.vue';
import PaymentsPage from '@/views/PaymentsPage.vue';
import CreatepaymentPage from '@/views/CreatepaymentPage.vue';
import ModifypaymentPage from '@/views/ModifypaymentPage.vue';




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
  component:Veriftelephone
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
  {
    path: '/invoices',
    component:InvoicesPage
  },
  {
    path: '/create-invoice',
    component:CreateinvoicePage
  },
  {
    path: '/tajrouba',
    component:tajrouba
  },
  {
    path: '/modify-invoice',
    component:ModifyinvoicePage
  },
  {
    path: '/payments',
    component:PaymentsPage
  },
  {
    path: '/create-payment',
    component:CreatepaymentPage
  },
  {
    path: '/modify-payment',
    component:ModifypaymentPage
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router