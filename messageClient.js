async function sendToVMWithReply(target, payload) {
  console.log(`Mock sendToVMWithReply called. Target: ${target}`);
  console.log("Payload:", payload);

  // Simulated responses based on payload type
  switch (payload.type) {
    case 'register':
      return { success: true, token: 'mock-token' };
    case 'login':
      return payload.password === 'correctpassword'
        ? { success: true, token: 'mock-token' }
        : { success: false, error: 'Invalid password' };
    case 'updateProfile':
      return { success: true };
    case 'submitParticipation':
      return { success: true };
    default:
      return { success: false, error: 'Unknown payload type' };
  }
}

module.exports = { sendToVMWithReply };
