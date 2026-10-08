import type {MenuItem} from '../types/menu'

const menu: MenuItem[] = [
  { icon: 'mdi-account-outline', text: 'brand.about', link: { name: 'Root' }, gallery: false, auth: false },
  {
    icon: 'mdi-home',
    text:'benefitsMvp.catalog',
    link: { name: "Catalog" },
    gallery: false,
    auth: false
  },
  { icon: 'mdi-store', text: 'company.menu', link: { name: 'CompanyCrudPage' }, gallery: true, auth: true, permission: 'company:manage' },
  { icon: 'mdi-shape', text: 'category.menu', link: { name: 'CategoryCrudPage' }, gallery: true, auth: true, permission: 'category:manage' },
  { icon: 'mdi-gift', text: 'benefit.menu', link: { name: 'BenefitCrudPage' }, gallery: true, auth: true, permission: 'benefit:manage' },
  { icon: 'mdi-ticket', text: 'benefitsMvp.coupons', link: { name: 'BenefitClaimCrudPage' }, gallery: true, auth: true, permission: 'benefitclaim:view' },
  { icon: 'mdi-qrcode-scan', text: 'benefitsMvp.operator', link: { name: 'CouponOperator' }, gallery: true, auth: true, permission: 'benefitclaim:view' },
  { icon: 'mdi-chart-bar', text: 'benefitsMvp.statistics', link: { name: 'BenefitStatistics' }, gallery: true, auth: true, permission: 'benefits:statistics' },
  {
    icon: 'mdi-account-circle',
    text:'admin',
    gallery: true,
    permission: 'user:manage',
    children: [
      {
        icon: 'mdi-domain',
        text:'tenant.menu',
        link: { name: "CrudTenant" },
        gallery: true,
        permission: 'tenant:manage'
      },
      {
        icon: 'mdi-chair-rolling',
        text:'role.menu',
        link: { name: "CrudRole" },
        gallery: true,
        permission: 'role:manage'
      },

      {
        icon: 'mdi-table-account',
        text:'user.menu',
        link: { name: "CrudUser" },
        gallery: true,
        permission: 'user:manage'
      },
      {
        icon: 'mdi mdi-table-key',
        text:'userapikey.menu',
        link: { name: "CrudUserApiKey" },
        gallery: true,
        permission: 'userApiKey:manage'
      },
      {
        icon: 'mdi-account-arrow-right',
        text:'usersession.menu',
        link: { name: "UserSessionCrudPage" },
        gallery: true,
        permission: 'usersession:menu'
      },
      {
        icon: 'mdi-lock-alert-outline',
        text:'userloginfail.menu',
        link: { name: "UserLoginFailCrudPage" },
        gallery: true,
        permission: 'userloginfail:manage'
      },
      {
        icon: 'mdi mdi-cog',
        text:'setting.menu',
        link: { name: "SettingPage" },
        gallery: true,
        permission: 'setting:manage'
      },

      {
        icon: 'mdi-view-dashboard-edit',
        text:'dashboard.menu',
        link: { name: "DashboardCrudPage" },
        gallery: true,
        permission: 'dashboard:manage'
      },
      {
        icon: 'mdi-police-badge',
        text:'audit.menu',
        link: { name: "AuditCrudPage" },
        gallery: true,
        permission: 'audit:manage'
      },
      {
        icon: 'mdi-file',
        text:'file.menu',
        link: { name: "FileCrudPage" },
        gallery: true,
        permission: 'file:manage'
      },
      {
        icon: 'mdi-robot',
        text:'ailog.menu',
        link: { name: "AILogCrudPage" },
        gallery: true,
        permission: 'ailog:manage'
      },
      {
        icon: 'mdi-lock-check',
        text:'Password Policy',
        link: { name: "PasswordPolicy" },
        gallery: true,
      },
    ]
  },
  {
    icon: 'mdi-information-box',
    text:'info',
    gallery: true,
    auth: false,
    children: [
      {
        icon: 'mdi-information-outline',
        text:'POLITICA PRIVACIDAD',
        link: { name: "PoliticaPrivacidad" },
        gallery: true,
        auth: true
      },
      {
        icon: 'mdi-frequently-asked-questions',
        text:'CONDICIONES SERVICIO',
        link: { name: "CondicionesServicio" },
        gallery: true,
        auth: true
      },
    ]
  }
]

export default menu

export {
  menu
}


