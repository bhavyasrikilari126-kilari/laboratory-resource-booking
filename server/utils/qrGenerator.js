const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const qrDataUrl = await QRCode.toDataURL(stringData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateQRCode };
