const baseUrl = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const heavyComputation = () => {
  let sum = 0;
  for (let i = 0; i < 1e7; i++) {
    sum += i;
  }
  return sum;
};

const runCpuIntensiveTask = () => {
  const start = new Date(); // Start timer
  const result = heavyComputation(); // This will take time due to recursion
  const end = new Date(); // End timer
  console.log(`Execution time: ${end - start}ms`);
};

/**
 *
 * @param {string} message
 * @param  {...any} args
 */
function info(message, ...args) {
  console.info(
    `[RUNTIME][${new Date().toISOString()}] INFO: ${message}`,
    ...args
  );
}

/**
 *
 * @param {string} message
 * @param  {...any} args
 */
function error(message, ...args) {
  console.error(
    `[RUNTIME][${new Date().toISOString()}] ERROR: ${message}`,
    ...args
  );
}

/**
 *
 * @returns {Promise<{requestId: string, deadline: Date, invokedFunctionArn: string, traceId: string, body: any}>}
 */
async function next() {
  const res = await fetch(`${baseUrl}/invocation/next`, {
    method: "GET",
  });

  if (!res.ok) {
    error("next failed", await res.text());
    return null;
  }
  info("next success", res.status, res.statusText);
  info("headers", res.headers);
  const body = await res.json();
  info("body", body);

  return {
    requestId: res.headers.get("Lambda-Runtime-Aws-Request-Id"),
    deadline: Number(res.headers.get("Lambda-Runtime-Deadline-Ms")),
    invokedFunctionArn: res.headers.get("Lambda-Runtime-Invoked-Function-Arn"),
    traceId: res.headers.get("Lambda-Runtime-Trace-Id"),
    body,
  };
}

/**
 *
 * @param {string} reason
 * @param {string} errorMessage
 * @param {string[]} stackTrace
 * @returns {Promise<void>}
 */
async function initializationError(reason, errorMessage, stackTrace) {
  const res = await fetch(`${baseUrl}/init/error`, {
    method: "POST",
    headers: {
      "Lambda-Runtime-Function-Error-Type": reason,
    },
    ErrorRequest: JSON.stringify({
      errorMessage,
      errorType: reason,
      stackTrace: stackTrace,
    }),
  });
  if (!res.ok) {
    error("init/error failed", await res.text());
  }
  info("init/error success", res.status, res.statusText);
  info("headers", res.headers);
  const body = await res.text();
  info("body", body);
}

/**
 * @param {string} requestId
 * @param {string} reason
 * @param {string} errorMessage
 * @param {string[]} stackTrace
 * @returns {Promise<void>}
 */
async function invocationError(requestId, reason, errorMessage, stackTrace) {
  const res = await fetch(`${baseUrl}/invocation/${requestId}/error`, {
    method: "POST",
    headers: {
      "Lambda-Runtime-Function-Error-Type": reason,
    },
    body: JSON.stringify({
      errorMessage,
      errorType: reason,
      stackTrace: stackTrace,
  }),
  });
  if (!res.ok) {
    error(" invocation error failed", await res.text());
  }
  info("invocation error success", res.status, res.statusText);
  info("headers", res.headers);
  const body = await res.text();
  info("body", body);
}

async function invocationResponse(requestId, response) {
  const res = await fetch(`${baseUrl}/invocation/${requestId}/response`, {
    method: "POST",
    body: JSON.stringify(response),
  });
  if (!res.ok) {
    error("invocation response failed", await res.text());
  }
  info("invocation response success", res.status, res.statusText);
  info("headers", res.headers);
  const body = await res.text();
  info("body", body);
}

/**
 *
 * @returns {Promise<Function>}
 */
async function initializeHandler() {
  info("Initializing runtime...");
  // Invoke the handler. Get it dynamically from _HANDLER environment variable. Remember that the structure is filename.method
  if (!process.env.LOCAL_HANDLER) {
    const errorString =
      "Handler not defined in environment variable LOCAL_HANDLER";
    error(errorString);
    await initializationError("Runtime.MissingHandler", errorString, []);
    process.exit(1);
  }
  const [handlerFile, handlerMethod] = process.env.LOCAL_HANDLER.split(".");

  // Try to loads js file and if not found, loads mjs file
  let module = undefined;
  try {
    module = await import(`./${handlerFile}.js`);
  } catch (e) {
    try {
      module = await import(`./${handlerFile}.mjs`);
    } catch (e) {
      const errorString = `Handler file ${handlerFile} not found`;
      error(errorString);
      await initializationError("Runtime.MissingHandlerFile", errorString, []);
      process.exit(1);
    }
  }

  if (handlerMethod in module === false) {
    const errorString = `Handler method ${handlerMethod} not found in ${handlerFile}`;
    error(errorString);
    await initializationError("Runtime.MissingHandlerMethod", errorString, []);
    process.exit(1);
  }

  info("Initialization complete");
  return module[handlerMethod];
}

// Cold start brrrrrr....
const handler = await initializeHandler();

// A while loop that runs the runtime loop
while (true) {
  info("Waiting for next invocation...");
  const event = await next();
  info("Received next invocation");

  const context = {
    getRemainingTimeInMillis: () => event.deadline - Date.now(),
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
    memoryLimitInMB: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
    awsRequestId: event.requestId,
    logGroupName: process.env.AWS_LAMBDA_LOG_GROUP_NAME,
    logStreamName: process.env.AWS_LAMBDA_LOG_STREAM_NAME,
    invokedFunctionArn: event.invokedFunctionArn,
    // We pull these values from the next endpoint, omitted for brevity
    // identity: null,
    // clientContext: null,
  };

  try {
    // Call the handler
    info("Calling handler");
    const response = await handler(event.body, context);
    info("Handler complete", response ? response : "with no response");

    await invocationResponse(event.requestId, response);
  } catch (e) {
    error("Error handling event", e);
    await invocationError(
      event.requestId,
      "Runtime.HandlerError",
      e.message,
      e.stack.split("\n")
    );
    continue;
  }
}
