import turnbackIcon from '@/assets/images/common/turnback.png';
import { Layout, Spin, Affix } from 'antd';
import type { LayoutProps } from 'antd/es/layout';
import React from 'react';
import { history, useAccess } from 'umi';
import styles from './index.less';
import classnames from 'classnames';

interface NormalLayoutProps extends LayoutProps {
  route?: any;
  loading?: boolean;
  style?: React.CSSProperties;
  layoutStyle?: React.CSSProperties;
  historyGo?: number | string;
  title?: string;
  visible?: boolean;
  bottomDom?: React.ReactNode;
  customBack?: () => void;
  toolBarRender?: React.ReactNode;
}

const NormalLayout: React.FC<NormalLayoutProps> = (props) => {
  const access = useAccess();

  if (props.route) {
    if (props.route.access && !access[props.route.access]) {
      history.push('/error/403');
    }
  }

  const goback = () => {
    if ('number' === typeof props.historyGo) {
      history.go(props.historyGo);
    } else if ('string' === typeof props.historyGo) {
      history.push(props.historyGo);
    } else {
      if (props.customBack) {
        props.customBack();
      } else {
        history.goBack();
      }
    }
  };

  const renderHeader = (title?: string) => {
    return (
      <div
        className={classnames({
          [styles.header]: true,
          [styles.mb0]: props.toolBarRender,
        })}
      >
        <img onClick={goback} src={turnbackIcon} alt="" className={styles.gobackIcon} />
        <div className={styles.txt}>{title}</div>
      </div>
    );
  };

  return (
    <Layout className={props.className} style={{ minHeight: '100%', ...props.style }}>
      <Layout
        style={{
          padding: props.visible ? '0px 24px' : '24px 24px',
          minHeight: '100%',
          ...props.layoutStyle,
        }}
      >
        <Spin spinning={props.loading || false} style={{ position: 'fixed' }}>
          {props.visible && renderHeader(props.title)}
          {/* 功能区域 */}
          {props.toolBarRender ? (
            <Affix offsetTop={56}>
              <div className={styles.toolBarRender}>{props.toolBarRender}</div>
            </Affix>
          ) : null}
          {props.children}
        </Spin>
      </Layout>
      {props.bottomDom && <>{props.bottomDom}</>}
    </Layout>
  );
};

export default NormalLayout;
