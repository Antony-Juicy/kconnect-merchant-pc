import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import CreateCategoryDrawer from './CreateCategoryDrawer';

export type EditCategoryDrawerProps = {
  categoryId: string;
} & KPayDrawerProps;

const EditCategoryDrawer: React.FC<EditCategoryDrawerProps> = (props) => {
  return <CreateCategoryDrawer key={props.categoryId} {...props} />;
};

export default EditCategoryDrawer;
