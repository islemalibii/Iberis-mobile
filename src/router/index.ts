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
import Dashboard from '@/views/Dashboard.vue';
import SendInvoive from '@/views/SendInvoive.vue';
import CompanyDetailsPage from '@/views/CompanyDetailsPage.vue';
import NotificationsPage from '@/views/NotificationPage.vue';
import Bonlivraison from '@/views/Bonlivraison.vue';
import Editdeliverynotes from '@/views/Editdeliverynotes.vue';
import Devis from '@/views/Devis.vue';
import BonSortie from '@/views/BonSortie.vue';
import EditBonsdeSortie from '@/views/EditBonsdeSortie.vue';
import EditEstimate from '@/views/EditEstimate.vue';
import FournisseurDetail from '@/views/FournisseurDetail.vue';
import Bonsdereception from '@/views/Bonsdereception.vue';
import EditReceipts from '@/views/EditReceipts.vue';
import Order from '@/views/Order.vue';
import Service from '@/views/Services.vue';
import Purechase from '@/views/Purechase.vue';
import CompanyBalanceView from '@/views/CompanyBalanceView.vue';
import CompanyTurnoverView from '@/views/CompanyTurnoverView.vue';
import RevenuesVsExpensesChart from '@/views/RevenuesVsExpnsesChart.vue';
import ResultsChart from '@/views/ResultsChart.vue';
import SalesChart from '@/views/SalesChart.vue';
import Permessions from '@/views/Permissions.vue';



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
    path: '/companyBalance',
    component: CompanyBalanceView
  },
  {
    path: '/permessions',
    component: Permessions
    },
       {
    path: '/SalesChart',
    component: SalesChart
    },
      {
    path: '/ResultsChart',
    component: ResultsChart
    },
     {
    path: '/RevenuesVsExpenses',
    component: RevenuesVsExpensesChart
    },
     {
    path: '/CompanyTurnover',
    component: CompanyTurnoverView
  },
  {
  path: '/verifytlph',
  component: Veriftelephone
  },
  {
  path: '/purechase',
  component: Purechase
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
    path: '/company-details',
    component: CompanyDetailsPage
  },
  {
    path: '/invoices',
    component:InvoicesPage
  },
  {
    path: "/clients/:id/bonslivraison",
    component: Bonlivraison, 
  },
  {
    path: "/provider/:id/service",
    component: Service, 
  },
  {
    path: "/provider/:id/reciept",
    component:Bonsdereception, 
  },
  {
    path: "/provider/:id/order",
    component:Order, 
  },
  {
  path: '/provider/:id/receipt/:idreceipt/edit_receipt',
  component: EditReceipts,
  props: (route) => ({
    ProviderId: route.params.id,
    receiptId: route.params.idrece // Bien passer les deux IDs
  })
  },
  {
    path: "/clients/:id/bonsortie",
    component:BonSortie, 
  },

  {
    path: "/clients/:id/devis",
    component: Devis, 
  },

  {
  path: '/clients/:id/estimate/:idestimate/edit_estimate',
  component: EditEstimate,
  props: (route) => ({
    clientId: route.params.id,
    estimateId: route.params.idestimate // Bien passer les deux IDs
  })
  },
  {
    path: '/clients/:id/timeline',
    component: () => import('@/views/ClientTimelineView.vue')
  },
  {
  path: '/fournisseur/:id/timeline',
  component: () => import('@/views/TimelineProvider.vue')
  },
  {
    path: '/clients/:id/bonslivraison/:idbons/edit-delivery',
    component: Editdeliverynotes,
      props: true 
  },
  {
    path: '/clients/:clientId/bonsortie/:id/edit-sortie',
    name: 'EditExitVoucher',
    component: EditBonsdeSortie,
    props: true 
  },

  {
    path: '/create-invoice',
    component:CreateinvoicePage
  },
  {
    path: '/invoices/:id/modify-invoice',
    component:ModifyinvoicePage
  },
  { path: "/invoices/:id/send-invoice",
    component:SendInvoive
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
    path: '/payments/:id/modify-payment',
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
    path: "/client/:id",
    component:ClientDetail, 
  },
  {
    path: '/notifications',
    component:NotificationsPage,
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
   { path: "/client/:id", 
   component:ClientDetail 
 }, 
   { path: "/fournisseur/:id", 
   component:FournisseurDetail
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