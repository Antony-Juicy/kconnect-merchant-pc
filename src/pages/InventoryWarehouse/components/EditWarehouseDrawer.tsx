import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import CreateWarehouseDrawer from './CreateWarehouseDrawer';

export type EditWarehouseDrawerProps = {
  warehouseId: string;
} & KPayDrawerProps;

const EditWarehouseDrawer: React.FC<EditWarehouseDrawerProps> = (props) => {
  return <CreateWarehouseDrawer key={props.warehouseId} {...props} />;
};

export default EditWarehouseDrawer;
