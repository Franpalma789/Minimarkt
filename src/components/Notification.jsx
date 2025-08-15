import React from 'react';

function Notification({ message, type = "success", onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} alert-floating`} role="alert" style={{
      position: 'fixed', top: 20, right: 20, zIndex: 1050, minWidth: 300
    }}>
      {message}
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
}

export default Notification;