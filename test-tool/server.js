// Import the framework and instantiate it
import Fastify from "fastify";
import FastifyCors from "@fastify/cors";
const fastify = Fastify({
  logger: true,
});

fastify.register(FastifyCors, {
  origin: "*",
});

// Declare a route
// http://localhost:3000/calculate?value=1
// http://localhost:3000/batch-calculate?value=1,2,3
fastify.get("/:params", async function handler(request, reply) {
  const value = request.query.value;
  const path = request.params.params;
  if (path === "calculate") {
    return { value: Number(value) * 2, color: "blue" };
  } else {
    const randomNum = Math.floor(Math.random() * 10) + 1;
    if (randomNum % 2 === 0) {
      const err = new Error("hello");
      err.statusCode = 400;
      err.myCustomError = "yo yo I am custom";
      throw err;
    }

    const values = value.split(",").map((val) => Number(val));
    return values.map((val) => {
      return { value: val * 2, color: "green" };
    });
  }
});

// Run the server!
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
