import Input from 'antd/lib/input';
import TrimInput from './TrimInput';
import TrimTextArea from './TrimTextArea';

type KPayInputComponent = {
  TrimInput: typeof TrimInput;
  TrimTextArea: typeof TrimTextArea;
} & typeof Input;

export type { TrimInputProps } from './TrimInput';
export type { TrimTextAreaProps } from './TrimTextArea';

const KPayInput: KPayInputComponent = Object.assign(Input, {
  TrimInput: TrimInput,
  TrimTextArea: TrimTextArea,
});

export default KPayInput;
