import Style from './index.less';
import logo from '@/assets/logo.svg';
import RightContent from '@/components/Layout/HeaderBar/RightContent';
const HeaderBar: React.FC = () => {

  return (
    <div className={Style.headerBarWapper}>
      <img src={logo} width={116} height={32} />
      <div className={Style.rightContent}>
        <div className={Style.selectStore} />
        <div className={Style.userInfo}>
          <RightContent />
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;
