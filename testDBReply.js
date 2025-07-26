const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

// RabbitMQ connection string — update this as needed
const RABBITMQ_URL = 'amqp://user:pass@insertiphere';

async function sendToVMWithReply(targetVM, payload) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  const exchange = 'vm_exchange';
  await channel.assertExchange(exchange, 'direct', { durable: false });

  const correlationId = uuidv4();
  const replyQueue = await channel.assertQueue('', { exclusive: true });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: No response from consumer'));
      channel.close();
      connection.close();
    }, 7000); // ⏱️ 7 seconds timeout

    channel.consume(
      replyQueue.queue,
      msg => {
        if (msg.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          const response = JSON.parse(msg.content.toString());
          resolve(response);
          channel.close();
          connection.close();
        }
      },
      { noAck: true }
    );

    // Send message to the correct VM
    const messageBuffer = Buffer.from(JSON.stringify(payload));
    channel.publish(exchange, targetVM, messageBuffer, {
      replyTo: replyQueue.queue,
      correlationId
    });
  });
}

module.exports = { sendToVMWithReply };
