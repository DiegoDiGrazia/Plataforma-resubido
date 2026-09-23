import React from 'react';

const COLORES = ['ee4c01', '1d1a9b', 'f238a7', 'efef43', '6d77ea'];

const SelectorColor = ({ title, selectedValue, onSelect }) => (
    <div className="mb-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">{title}</span>
            <div className="d-flex gap-2">
                {COLORES.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => onSelect(c)}
                        title={`#${c}`}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: `#${c}`,
                            border: selectedValue === c ? '3px solid #000' : '1px solid #ccc',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    />
                ))}
            </div>
        </div>
    </div>
);

export default SelectorColor;
