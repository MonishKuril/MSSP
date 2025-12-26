import React from 'react';
import './FormWrapper.css';

const FormWrapper = ({ title, onCancel, children }) => {
  return (
    <div className="form-wrapper">
      <div className="form-wrapper-header">
        <h2>{title}</h2>
        <button onClick={onCancel} className="cancel-btn">&times; Cancel</button>
      </div>
      <div className="form-wrapper-body">
        {children}
      </div>
    </div>
  );
};

export default FormWrapper;
