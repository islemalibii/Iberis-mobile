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
import ModifyinvoicePage from '@/views/ModifyinvoicePage.vue';
import PaymentsPage from '@/views/PaymentsPage.vue';
import CreatepaymentPage from '@/views/CreatepaymentPage.vue';
import ModifypaymentPage from '@/views/ModifypaymentPage.vue';
import Profileuser from '@/views/Profileuser.vue';
import Clients from '@/views/Clients.vue';
import AddClient from '@/views/AddClient.vue';
import EditClient from '@/views/EditClient.vue';
import AddFournisseur from '@/views/AddFournisseur.vue';
import Fournisseur from '@/views/Fournisseur.vue';
import EditFournisseur from '@/views/EditFournisseur.vue';
import ClientDetail from '@/views/ClientDetail.vue';
import ClientTransactions from '@/views/ClientTransactions.vue';
import Dashboard from '@/views/Dashboard.vue';




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
  component: ForgetPassword
  },
  {
  path: '/verifytlph',
  component: Veriftelephone
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
    component: CreatecompanyPage
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
  {
    path: '/profile',
    component:Profileuser
  },
  {
    path: '/clients',
    component:Clients
  },
  {
    path: "/detailclient/:id",
    component:ClientDetail, 
  },
  {
    path: "/client/:id/transactions",
    component: ClientTransactions, 
  },
  { path: "/add-client",
     component:AddClient 
    },
  { path: "/edit-client/:id", 
    component: EditClient, props: true 
  }, 

{ path: "/add-fournisseur",
   component:AddFournisseur
  },

{ path: "/fournisseur",
   component:Fournisseur 
  },
  { path: "/edit-fournisseur/:id", 
    component: EditFournisseur, props: true 
  }, 
  { path: "/dashboard",
    component:Dashboard
   },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router