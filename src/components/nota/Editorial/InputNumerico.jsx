import React, { useState, useEffect } from 'react';

const InputNumerico = ({
  title,
  selectedValue,
  onSelect = () => {},
  onClear = () => {},
  isPercentual = false,
  isDecimal = false,
  min = 0,
  max = 100
}) => {

  const [value, setValue] = useState(selectedValue || '');

  useEffect(() => {
    setValue(selectedValue ?? '');
  }, [selectedValue]);

  const handleChange = (e) => {
    let val = e.target.value;

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

    setValue(val);        // 👈 importante: guardamos lo que escribe el usuario
    onSelect(number);     // 👈 actualizamos el estado padre
  };

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-bold">{title}</span>

        <div className="input-group" style={{ maxWidth: "220px" }}>
          <input
            type="text"
            className="form-control"
            placeholder={`${min} - ${max}`}
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