import React, { useState, useEffect } from 'react';

const InputNumerico = ({
  title,
  selectedValue,
  onSelect = () => {},
  onClear = () => {},
  isPercentual = false,
  isDecimal = false,
  isMoney = false,
  min = 0,
  max = 100
}) => {

  const [value, setValue] = useState(selectedValue || '');

  useEffect(() => {
    if (isMoney) {
      const texto = (selectedValue === '' || selectedValue == null)
        ? ''
        : String(selectedValue).replace('.', ',');
      setValue(texto);
    } else {
      setValue(selectedValue ?? '');
    }
  }, [selectedValue, isMoney]);

  const handleChange = (e) => {
    let val = e.target.value;

    // 👉 modo pesos: acepta coma como separador decimal
    if (isMoney) {
      if (val === '') {
        setValue('');
        onClear();
        return;
      }

      const regexMoney = /^\d*,?\d{0,2}$/;
      if (!regexMoney.test(val)) return;

      const number = Number(val.replace(',', '.'));

      if (isNaN(number)) return;
      if (number < min || number > max) return;

      setValue(val);
      onSelect(number);

      return;
    }

    // 👉 modo normal
    if (val === '') {
      setValue('');
      onClear();
      return;
    }

    // permitir coma como decimal
    if (isDecimal) {
      val = val.replace(',', '.');
    }

    const regex = isDecimal
      ? /^\d*\.?\d{0,2}$/
      : /^\d+$/;

    if (!regex.test(val)) return;

    const number = Number(val);

    if (isNaN(number)) return;
    if (number < min || number > max) return;

    setValue(val);
    onSelect(number);
  };

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-bold">{title}</span>

        <div className="input-group" style={{ maxWidth: "220px" }}>
          {isMoney && (
            <span className="input-group-text">$</span>
          )}
          <input
            type="text"
            className="form-control"
            placeholder={
              isMoney
                ? "0,00"
                : `${min} - ${max}`
            }
            value={value}
            onChange={handleChange}
          />

          {isPercentual && (
            <span className="input-group-text">%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputNumerico;