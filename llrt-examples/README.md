# Running instructions
Run the following code examples using the LLRT runtime.

`./binaries/llrt-darwin examples/hello-world.mjs`

Few comments:
1. LLRT uses `~/.aws/credentials` or AWS environment variables to determine the right credentials and region.
2. LLRT supports both ecm and cjs, just change the suffix to use the correct mod of running.

Example List:
1. `hello-world.mjs` - Prints hello world to the screen.
2. `list-lambdas` - A full fledged AWS CLI app that pulls your current role, prints it and then list the Lambdas found in your account.

