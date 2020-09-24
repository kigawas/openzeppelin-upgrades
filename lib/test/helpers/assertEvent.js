"use strict";
// TS-TODO: use typed web3 stuff here
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
function inLogs(logs, eventName, eventArgs = {}) {
    const event = logs.find((e) => e.event === eventName && Object.entries(eventArgs).every(([k, v]) => e.args[k] === v));
    assert_1.default(!!event, `Expected to find ${eventName} with ${eventArgs} in ${logs}`);
    return event;
}
async function inTransaction(tx, eventName, eventArgs = {}) {
    const { logs } = await tx;
    return inLogs(logs, eventName, eventArgs);
}
exports.default = {
    inLogs,
    inTransaction,
};
//# sourceMappingURL=assertEvent.js.map