import QRCode from 'qrcode';

/**
 * @param {string} ticketId 
 * @returns {Promise<string>} 
 */
export const generateTicketQR = async (ticketId) => {
  const baseUrl = process.env.APP_BASE_URL;
  const validationUrl = `${baseUrl}/api/tickets/${ticketId}/validate`;

  return QRCode.toDataURL(validationUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
};