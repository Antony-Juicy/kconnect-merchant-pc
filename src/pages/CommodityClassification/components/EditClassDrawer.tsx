import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import CreateClassDrawer from './CreateClassDrawer';

export type EditClassDrawerProps = {
  categoryId: string;
} & KPayDrawerProps;

const EditClassDrawer: React.FC<EditClassDrawerProps> = (props) => {
  return <CreateClassDrawer key={props.categoryId} {...props} />;
};

export default EditClassDrawer;
