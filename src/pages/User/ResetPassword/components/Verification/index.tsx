import { Input, Space } from 'antd';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const InputCode = () => {
  const inputRef = useRef(null);
  const [check, setCheck] = useState<number>(0);
  const [arr, setArr] = useState(['', '', '', '', '', '']);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;

    setTimeout(() => {
      setArr((prev) => {
        const list = [...prev];
        list[index] = value[0];
        return list;
      });
      setCheck(index < 5 ? index + 1 : index);
      // console.log(index,arr)
      if (index <= arr.length - 1) {
        // @ts-ignore
        inputRef.current && inputRef.current!.focus();
      }
    }, 0);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const { key, keyCode } = e;
    if (keyCode === 8 && key === 'Backspace') {
      // @ts-ignore
      if (index === 0 && !e.target.value) return;
      setTimeout(() => {
        setCheck(index - 1);
        // @ts-ignore
        inputRef.current && inputRef.current!.focus();
      }, 0);
      setArr((prev) => {
        const list = [...prev];
        list[index] = '';
        return list;
      });
    }
  };
  return (
    <div className={styles.fication}>
      <Space>
        <div className={styles.tion}>
          {arr.map((item, index) => {
            // console.log(index,check)
            return (
              <Input
                value={arr[index]}
                {...(index === check ? { ref: inputRef } : {})}
                max={1}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            );
          })}
        </div>
      </Space>
    </div>
  );
};
export default InputCode;
