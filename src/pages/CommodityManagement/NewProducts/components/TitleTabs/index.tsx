import React, { useState } from 'react';
import styles from './index.less';
import classnames from 'classnames';
import { Anchor } from 'antd';
import useLocale from '@/hooks/useLocale';

const { Link } = Anchor;

// 锚点定位
export const mapHashAnchor = {
  ANCHOR_COMMODITY_INFO: 'anchor-commodity-info',
  ANCHOR_STYLES_OPTION: 'anchor-styles-option',
  ANCHOR_INVENTORY_SETTING: 'anchor-inventory-setting',
  ANCHOR_OTHER_INFORMATION: 'anchor-other-information',
};

// 锚点映射款项卡下标
const mapTabIndex = {
  '#anchor-commodity-info': 0,
  '#anchor-styles-option': 1,
  '#anchor-inventory-setting': 2,
  '#anchor-other-information': 3,
};

const TitleTabs: React.FC = () => {
  const { getMessage } = useLocale();
  // tabs选中索引下标
  const [tabIndex, setTabIndex] = useState(0);
  // tabs选项列表
  const [tabList] = useState([
    {
      title: getMessage('commodity.addProduct.commodity.information', '商品資料'),
      href: `#${mapHashAnchor.ANCHOR_COMMODITY_INFO}`,
    },
    {
      title: getMessage('commodity.addProduct.style.options', '款式選項'),
      href: `#${mapHashAnchor.ANCHOR_STYLES_OPTION}`,
    },
    {
      title: getMessage('commodity.productDetail.inventory.setting', '庫存設定'),
      href: `#${mapHashAnchor.ANCHOR_INVENTORY_SETTING}`,
    },
    {
      title: getMessage('commodity.addProduct.other.information', '其他資料'),
      href: `#${mapHashAnchor.ANCHOR_OTHER_INFORMATION}`,
    },
  ]);

  const onChange = (link: string) => {
    if (link) {
      setTabIndex(mapTabIndex[link]);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabsContainer}>
        <Anchor affix={false} offsetTop={110} onChange={onChange}>
          {tabList.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              title={
                <div
                  className={styles.tabsItem}
                  key={item.title}
                  onClick={() => setTabIndex(index)}
                >
                  <span
                    className={classnames({
                      [styles.text]: true,
                      [styles.activeText]: tabIndex == index,
                    })}
                  >
                    {item.title}
                  </span>
                  <span
                    className={classnames({
                      [styles.line]: true,
                      [styles.activeLine]: tabIndex == index,
                    })}
                  />
                </div>
              }
            />
          ))}
        </Anchor>
      </div>
    </div>
  );
};

export default TitleTabs;
