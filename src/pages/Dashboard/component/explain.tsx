import emptyIcon from '@/assets/images/common/empty.png';
import type { DocumentationUserExplainResponse } from '@/services/api';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import React from 'react';
import { history } from 'umi';
import css from './explain.less';
type TSprops = {
  data: DocumentationUserExplainResponse;
};

const Explain: React.FC<TSprops> = (props) => {
  const gotoDetail = () => {
    event(BuriedPoint.KC_OA_INSTRUCTIONS_TAPPED); // 埋点-点击使用说明
    const linkUrl = props.data?.zhLinkUrl || props.data?.enLinkUrl;
    if (props.data && linkUrl) {
      window.open(linkUrl);
    } else if (props.data && props.data?.documentationId && !linkUrl) {
      history.push(`/main/dashboard/explain?id=${props.data.documentationId}`);
    }
  };

  return (
    <div className={css.explain}>
      {props.data && props.data?.coverUrl ? (
        <img onClick={gotoDetail} className={css.cover} src={props.data.coverUrl} />
      ) : (
        <div className={css.emptyBox}>
          <img src={emptyIcon} className={css.emptyImg} />
        </div>
      )}
    </div>
  );
};

export default Explain;
