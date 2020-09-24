"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transactions_1 = __importDefault(require("./Transactions"));
const encodeCall_1 = __importDefault(require("../helpers/encodeCall"));
const Logger_1 = require("../utils/Logger");
async function migrate(appAddress, proxyAddress, proxyAdminAddress, txParams = {}) {
    const data = encodeCall_1.default('changeProxyAdmin', ['address', 'address'], [proxyAddress, proxyAdminAddress]);
    Logger_1.Loggy.spin(__filename, 'migrate', 'migrate-version', `Proxy ${proxyAddress} admin changed to ${proxyAdminAddress}`);
    await Transactions_1.default.sendRawTransaction(appAddress, { data }, Object.assign({}, txParams));
    Logger_1.Loggy.succeed('migrate-version', `Proxy ${proxyAddress} admin changed to ${proxyAdminAddress}`);
}
exports.default = migrate;
//# sourceMappingURL=Migrator.js.map