// Direct environment configuration
const environment = {
    GOOGLE_CLIENT_ID: '586007805045-7cboqpf6hpa0djnstaol2l77tsh17413.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: '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',
    JWT_SECRET: '97cf82359898b82a08a0d91370df298ff656d9fcf8613e533557ecc9201e2751',
    SESSION_SECRET: 'beed6486347ff16323b4d0d0efdb18971442b14413891581be6fe1d29c297a61'
  };
  
  // Log the configuration (remove in production)
  console.log('Environment configuration loaded:');
  console.log('- GOOGLE_CLIENT_ID:', environment.GOOGLE_CLIENT_ID ? '✓ Set' : '❌ Missing');
  console.log('- GOOGLE_CLIENT_SECRET:', environment.GOOGLE_CLIENT_SECRET ? '✓ Set' : '❌ Missing');
  
  module.exports = environment;