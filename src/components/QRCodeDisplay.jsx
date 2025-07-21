// src/components/QRCodeDisplay.jsx
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeDisplay = ({ visitorId }) => {
  const qrLink = `${window.location.origin}/register/${visitorId}`; // E.g., http://localhost:5173/register/VIS-00123

  return (
    <div className="flex justify-center mt-4">
      <QRCodeCanvas value={qrLink} size={160} level="H" />
    </div>
  );
};
        
export default QRCodeDisplay;
