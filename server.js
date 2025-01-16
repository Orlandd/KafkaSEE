const express = require("express");
const kafka = require("kafka-node");
const app = express();
const port = 3001;

app.use(express.static("public"));

// Kafka configuration for ConsumerGroup
const ConsumerGroup = kafka.ConsumerGroup;
const options = {
  kafkaHost: "localhost:9092",
  groupId: "sse-consumer-group",
  fromOffset: "earliest",
  autoCommit: false,
};

const consumerGroup = new ConsumerGroup(options, "temperature-data");

// Handle Kafka consumer errors
consumerGroup.on("error", (err) => {
  console.error("Kafka Consumer error:", err);
});

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow CORS if needed

  console.log("New SSE connection established");

  consumerGroup.on("message", (message) => {
    try {
      const parsedData = JSON.parse(message.value); // Parsing JSON string
      const temperature = parsedData.temperature;
      const sentTimestamp = parsedData.timestamp; // Use timestamp from producer

      if (temperature === undefined || sentTimestamp === undefined) {
        console.error("Invalid data:", message.value);
        return;
      }

      // Ensure sentTimestamp is in milliseconds and calculate response time
      const receivedTimestamp = Date.now(); // Time when message is received
      const responseTime = `${receivedTimestamp - sentTimestamp} ms`; // Response time in ms

      // Send temperature and response time to client
      const simplifiedData = {
        temperature: temperature,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
      };

      res.write(`data: ${JSON.stringify(simplifiedData)}\n\n`);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Handle connection close
  req.on("close", () => {
    console.log("Client closed connection");
    res.end();
  });
});

app.listen(port, () => {
  console.log(`SSE server with Kafka running at http://localhost:${port}`);
});
