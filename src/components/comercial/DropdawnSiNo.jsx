import React from "react";

const DropdownSiNo = ({ label, name, value, setFormData }) => {
  const handleChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

      <div className="dropdown">
        <button
          className="btn btn-secondary dropdown-toggle w-100 text-start"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {value === "NO" ? "No" : "Si"}
        </button>

        <ul className="dropdown-menu w-100">
          <li>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleChange("NO")}
            >
              No
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleChange("SI")}
            >
              Si
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DropdownSiNo;
