const fucName  = "hello"
const module = await require("./utils.mjs")

if (fucName in module === false) {
    throw new Error(`Function ${fucName} not found`);
}
console.info(module[fucName]());
