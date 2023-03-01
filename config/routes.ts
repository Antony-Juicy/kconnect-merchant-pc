import { defineConfig } from 'umi';

// 用户登录
const constantRoutes: Object[] = [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        // name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      {
        // name: 'codeLogin',
        path: '/user/codeLogin',
        component: './User/CodeLogin',
      },
      {
        name: 'ResetPassword',
        path: '/user/ResetPassword',
        component: './User/ResetPassword',
      },
      {
        path: '/user/UserAgreement',
        component: './User/Agreement',
      },

      {
        name: 'ChangePassword',
        path: '/user/ChangePassword',
        component: './User/ChangePassword',
      },
      {
        path: '/user/emailLogin',
        component: './User/EmailLogin',
      },
      {
        hideInMenu: true,
        component: './404',
      },

    ],
  },
];

// 业务模块
const dynamicRoutes: Object[] = [
  {
    path: '/main',
    name: 'main',
    // defaultMessage: '主頁',
    access: 'merchant',
    // icon: 'smile',
    routes: [
      {
        path: '/main/dashboard',
        name: 'dashboard',
        icon: 'dashboardIcon',
        defaultMessage: '總覽',
        component: './Dashboard',
      },
      {
        path: '/main/dashboard/news',
        name: 'dashboardNews',
        defaultMessage: '熱點新聞',
        hideInMenu: true,
        component: './News',
      },
      {     
        path: '/main/dashboard/explain',
        name: 'dashboardExplain',
        hideInMenu: true,
        defaultMessage: '使用說明',
        component: './Explain',
      },
      {
        path: '/main/transaction',
        name: 'transaction',
        icon: 'tradeIcon',
        defaultMessage: '交易管理',
        routes: [
          {
            path: '/main/transaction/overview',
            name: 'transactionOverview',
            defaultMessage: '交易概覽',
            // component: './Transaction',
          },
          {
            path: '/main/transaction/record',
            name: 'transactionRecord',
            defaultMessage: '交易紀錄',
            // component: './TransactionRecord',
          },
          {
            path: '/main/transaction/settlement',
            name: 'settlementRecord',
            defaultMessage: '結算紀錄',
            // component: './SettlementRecord',
          },
        ],
      },

      {
        path: '/main/application',
        name: 'application',
        icon: 'appIcon',
        defaultMessage: '應用中心',
        // component: './Application',
        routes: [
          {
            path: '/main/application/appMark',
            name: 'appMark',
            // access: '',
            defaultMessage: '應用商店',
            component: './Application/appMark',
            // component: './Application',
          },
          {
            path: '/main/application/myApp',
            name: 'myApp',
            // access: '',
            defaultMessage: '我的應用',
            component: './Application/myApp',
            // component: './Application',
          },
          {
            path: '/main/application/detail/:id',
            name: 'appDetail',
            // access: '',
            hideInMenu: true,
            defaultMessage: '應用詳情',
            component: './Application/appDetail',
          },
          {
            path: '/main/application/case/:id',
            name: 'caseDetail',
            defaultMessage: '個案詳情',
            component: './Application/caseDetail',
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/main/structure',
        name: 'structure',
        icon: 'structureIcon',
        defaultMessage: '公司架構',
        // component: './Structure',
        component: './ComingSoon',
      },
      {
        path: '/main/commodity',
        name: 'commodity',
        icon: 'commodityIcon',
        defaultMessage: '商品管理',
        routes: [
          {
            path: '/main/commodity/list',
            name: 'products',
            defaultMessage: '商品列表',
            component: './CommodityManagement',
          },
          {
            path: '/main/commodity/skuProperty',
            name: 'commoditySkuProperty',
            defaultMessage: '款式選項管理',
            component: './CommoditySkuProperty',
          },
          {
            path: '/main/commodity/category',
            name: 'commodityCategory',
            defaultMessage: '類別管理',
            component: './CommodityCategory',
          },
          {
            path: '/main/commodity/classification',
            name: 'commodityClassification',
            defaultMessage: '分類管理',
            component: './CommodityClassification',
          },
          {
            path: '/main/commodity/import',
            name: 'productsImport',
            defaultMessage: '商品匯入',
            component: './CommodityManagement/ProductImport',
            hideInMenu: true,
          },
          {
            path: '/main/commodity/newProduct',
            name: 'newProduct',
            defaultMessage: '新增商品',
            component: './CommodityManagement/NewProducts',
            hideInMenu: true,
          },
          {
            path: '/main/commodity/editProduct',
            name: 'editProduct',
            defaultMessage: '編輯商品',
            component: './CommodityManagement/NewProducts',
            hideInMenu: true,
          },
          {
            path: '/main/commodity/productDetail/:id',
            name: 'productDetail',
            defaultMessage: '商品详情',
            component: './CommodityManagement/ProductDetail',
            hideInMenu: true,
          },
          {
            path: '/main/commodity/brandList',
            name: 'brandManagement',
            defaultMessage: '品牌管理',
            component: './CommodityManagement/BrandManagement',
          },
        ],
      },
      {
        path: '/main/inventory',
        name: 'inventory',
        icon: 'inventoryIcon',
        defaultMessage: '庫存管理',
        routes: [
          {
            path: '/main/inventory/warehouse',
            name: 'inventoryWarehouseManagement',
            defaultMessage: '倉庫管理',
            component: './InventoryWarehouse',
          },
          {
            path: '/main/inventory/product',
            name: 'inventoryProduct',
            defaultMessage: '商品庫存',
            component: './InventoryProduct',
          },
          {
            path: '/main/inventory/change',
            name: 'inventoryChange',
            defaultMessage: '庫存變更',
            component: './InventoryChange',
          },
          {
            path: '/main/inventory/add',
            name: 'inventoryAdd',
            defaultMessage: '新增變更',
            component: './AddInventoryChange',
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/main/price',
        name: 'price',
        icon: 'priceIcon',
        defaultMessage: '價格管理',
        routes: [
          {
            path: '/main/price/record',
            name: 'priceRecord',
            defaultMessage: '價格紀錄',
            component: './PriceRecord',
          },
          {
            path: '/main/price/page',
            name: 'pricePage',
            defaultMessage: '調整價格',
            component: './PricePage',
          },
        ],
      },
      {
        path: '/main/dashboard/announcement',
        name: 'announcement',
        icon: 'announceIcon',
        defaultMessage: '更新公告',
        component: './Announcement',
        hideInMenu: true,
      },
      {
        path: '/main/application/:id',
        name: 'applicationDetail',
        defaultMessage: '應用程式詳情',
        component: './Application/detail',
        hideInMenu: true,
      },

      {
        hideInMenu: true,
        component: './404',
      },
    ],
  },


  {
    path: '/others',
    name: 'others',
    hideInMenu: true,
    // defaultMessage: '其他',
    access: 'merchant',
    // icon: 'smile',
    routes: [
      {
        path: '/others/center',
        name: 'center',
        icon: 'centerIcon',
        hideInMenu: true,
        defaultMessage: '幫助中心',
        component: './Center',
      },
      {
        path: '/others/center/detail/:id',
        name: 'centerDetail',
        defaultMessage: '詳情頁',
        component: './Center/detail',
        hideInMenu: true,
      },
      {
        hideInMenu: true,
        component: './404',
      },
    ],
  },
  {
    path: '/agreement',
    layout: false,
    // name: 'Agreement',
    component: './Agreement',
    hideInMenu: true,
  },
  {
    path: '/profile',
    name: 'profile',
    defaultMessage: 'profile',
    access: 'profile',
    hideInMenu: true,
    routes: [
      {
        path: '/profile',
        name: 'profile',
        hideInMenu: true,
        defaultMessage: '個人資訊',
        component: './User/Profile',
      },
      {
        hideInMenu: true,
        component: './404',
      },
    ],
  },
  {
    path: '/auth',
    name: 'auth',
    defaultMessage: '允許權限',
    hideInMenu: true,
    layout: false,
    routes: [
      {
        name: 'authorize',
        path: '/auth/authorize/:id',
        defaultMessage: '允許權限',
        hideInMenu: true,
        component: './Authorize',
      },
      {
        hideInMenu: true,
        component: './404',
      },
    ],
  },
  {
    path: '/',
    redirect: '/main/dashboard',
  },
  {
    hideInMenu: true,
    component: './404',
  },
];

export default defineConfig({
  routes: constantRoutes.concat(dynamicRoutes),
});
