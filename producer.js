const kafka = require("kafka-node");
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });
const producer = new Producer(client);

const topic = "temperature-data";

// Log when producer is ready
producer.on("ready", () => {
  console.log("Producer is ready");
});

// Handle any errors with the producer
producer.on("error", (err) => {
  console.error("Producer error:", err);
});

setInterval(() => {
  const temperature = Math.floor(Math.random() * 40); // Random temperature
  const message = JSON.stringify({ temperature, timestamp: Date.now() }); // Include timestamp
  const payloads = [{ topic, messages: message }];

  // Send message to Kafka
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error("Error sending message:", err);
    } else {
      console.log("Message sent:", data);
    }
  });
}, 2000);
