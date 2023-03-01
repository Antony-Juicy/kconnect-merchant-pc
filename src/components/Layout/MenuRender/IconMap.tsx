import activeGoods from '@/assets/svgs/menus/active-goods.svg';
import activeStock from '@/assets/svgs/menus/active-inventory.svg';
import activePrice from '@/assets/svgs/menus/active-price.svg';
import activeTrade from '@/assets/svgs/menus/active-transaction.svg';
import application from '@/assets/svgs/menus/application.svg';
import corporate from '@/assets/svgs/menus/corporate.svg';
import dashboard from '@/assets/svgs/menus/dashboard.svg';
import goods from '@/assets/svgs/menus/goods.svg';
import helpCenter from '@/assets/svgs/menus/helpCenter.svg';
import stock from '@/assets/svgs/menus/inventory.svg';
import member from '@/assets/svgs/menus/management.svg';
import price from '@/assets/svgs/menus/price.svg';
import structure from '@/assets/svgs/menus/structure.svg';
import trade from '@/assets/svgs/menus/transaction.svg';
import updateAnnounce from '@/assets/svgs/menus/updateAnnounce.svg';
import product from '@/assets/svgs/menus/product.svg';

import activeDashboard from '@/assets/svgs/menus/active-dashboard.svg';
import activeUpdateAnnounce from '@/assets/svgs/menus/active-updateAnnounce.svg';

import activeApplication from '@/assets/svgs/menus/active-application.svg';
import activeCorporate from '@/assets/svgs/menus/active-corporate.svg';
import activeHelpCenter from '@/assets/svgs/menus/active-helpCenter.svg';
import activeMemberIcon from '@/assets/svgs/menus/active-memberIcon.svg';
import activeStructure from '@/assets/svgs/menus/active-structure.svg';

import productManage from '@/assets/svgs/menus/productManage.svg';
import activeProductManage from '@/assets/svgs/menus/active-productManage.svg';
import inventoryManage from '@/assets/svgs/menus/inventoryManage.svg';
import activeInventoryManage from '@/assets/svgs/menus/active-inventoryManage.svg';

import Style from './index.less';

export default {
  dashboardIcon: (
    <img className={Style.subMenuIcon} width="18" height="18" src={dashboard} alt="" />
  ),
  centerIcon: <img className={Style.subMenuIcon} width="18" height="18" src={helpCenter} alt="" />,
  appIcon: <img className={Style.subMenuIcon} width="18" height="18" src={application} alt="" />,
  structureIcon: (
    <img className={Style.subMenuIcon} width="18" height="18" src={structure} alt="" />
  ),
  corporateIcon: (
    <img className={Style.subMenuIcon} width="18" height="18" src={corporate} alt="" />
  ),
  memberIcon: <img className={Style.subMenuIcon} width="18" height="18" src={member} alt="" />,
  announceIcon: (
    <img className={Style.subMenuIcon} width="18" height="18" src={updateAnnounce} alt="" />
  ),
  tradeIcon: <img className={Style.subMenuIcon} width="18" height="18" src={trade} alt="" />,
  priceIcon: <img className={Style.subMenuIcon} width="18" height="18" src={price} alt="" />,
  stockIcon: <img className={Style.subMenuIcon} width="18" height="18" src={stock} alt="" />,
  goodsIcon: <img className={Style.subMenuIcon} width="18" height="18" src={goods} alt="" />,
  productIcon: <img className={Style.subMenuIcon} width="18" height="18" src={product} alt="" />,

  commodityIcon: (
    <img className={Style.subMenuIcon} width="18" height="18" src={productManage} alt="" />
  ),
  'active-commodityIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeProductManage} alt="" />
  ),
  inventoryIcon: (
    <img className={Style.subMenuIcon} width="18" height="18" src={inventoryManage} alt="" />
  ),
  'active-inventoryIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeInventoryManage} alt="" />
  ),

  'active-dashboardIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeDashboard} alt="" />
  ),
  'active-tradeIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeTrade} alt="" />
  ),
  'active-stockIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeStock} alt="" />
  ),
  'active-priceIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activePrice} alt="" />
  ),
  'active-goodsIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeGoods} alt="" />
  ),

  'active-centerIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeHelpCenter} alt="" />
  ),
  'active-appIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeApplication} alt="" />
  ),
  'active-structureIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeStructure} alt="" />
  ),
  'active-corporateIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeCorporate} alt="" />
  ),
  'active-memberIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeMemberIcon} alt="" />
  ),
  'active-announceIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={activeUpdateAnnounce} alt="" />
  ),
  'active-productIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={product} alt="" />
  ),
  'active-priceIcon': (
    <img className={Style.subMenuIcon} width="18" height="18" src={price} alt="" />
  ),
};
