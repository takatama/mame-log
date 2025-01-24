interface OptionEditorProps<T> {
  options: T[];
  onOptionsChange: (updatedOptions: T[]) => void;
  addOption?: () => T;
  valueAccessor?: (option: T) => string | number; // 値を取得する関数
  onChangeAccessor?: (option: T, value: string | number) => T; // 値を更新する関数
  isNumeric?: boolean; // 数値入力を許可するか
}

const OptionEditor = <T,>({
  options,
  onOptionsChange,
  addOption=() => '' as any,
  valueAccessor=(option) => option as any,
  onChangeAccessor=(option, value) => value as any,
  isNumeric = false,
}: OptionEditorProps<T>) => {
  const handleAddOption = () => {
    onOptionsChange([...options, addOption()]);
  };

  const handleDeleteOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onOptionsChange(updatedOptions);
  };

  const handleOptionChange = (index: number, value: string | number) => {
    const updatedOptions = [...options];
    updatedOptions[index] = onChangeAccessor(options[index], value);
    onOptionsChange(updatedOptions);
  };

  return (
    <>
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={valueAccessor(option)} // 値を取得
            inputMode={isNumeric ? 'numeric' : undefined}
            onChange={(e) =>
              handleOptionChange(
                index,
                isNumeric ? Number(e.target.value) : e.target.value
              )
            }
            className="block border rounded-md p-2 w-3/4"
          />
          <button
            type="button"
            onClick={() => handleDeleteOption(index)}
            className="bg-red-500 text-white p-2 rounded-md w-1/4"
          >
            削除
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddOption}
        className="bg-green-500 text-white p-2 rounded-md"
      >
        追加
      </button>
    </>
  );
};

export default OptionEditor;
