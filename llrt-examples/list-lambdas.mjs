import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { LambdaClient, ListFunctionsCommand } from "@aws-sdk/client-lambda";

console.info("Step 1 - get Account details");

const stsClient = new STSClient({});
const getCallerIdentityCommand = new GetCallerIdentityCommand();
const data = await stsClient.send(getCallerIdentityCommand);
console.info("Account Id: ", data.Account);
console.info("User Name: ", data.UserId);

console.info("Step 2 - loading list of Lambdas in your AWS Account");
const lambdaClient = new LambdaClient();
const listFunctionsCommand = new ListFunctionsCommand({});
const lambdaList = await lambdaClient.send(listFunctionsCommand);
console.info(
  "Lambdas: ",
  lambdaList.Functions.map((f) => f.FunctionName)
);
