"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Proxy_1 = __importDefault(require("../proxy/Proxy"));
const Logger_1 = require("../utils/Logger");
const ZWeb3_1 = __importDefault(require("../artifacts/ZWeb3"));
const BaseSimpleProject_1 = __importDefault(require("./BaseSimpleProject"));
class SimpleProject extends BaseSimpleProject_1.default {
    constructor(name = 'main', proxyFactory, txParams = {}) {
        super(name, proxyFactory, txParams);
    }
    async upgradeProxy(proxyAddress, contract, contractParams = {}) {
        const { implementationAddress, pAddress, initCallData } = await this._setUpgradeParams(proxyAddress, contract, contractParams);
        Logger_1.Loggy.spin(__filename, 'upgradeProxy', `action-proxy-${pAddress}`, `Upgrading instance at ${pAddress}`);
        const proxy = Proxy_1.default.at(pAddress, this.txParams);
        await proxy.upgradeTo(implementationAddress, initCallData);
        Logger_1.Loggy.succeed(`action-proxy-${pAddress}`, `Instance at ${pAddress} upgraded`);
        return contract.at(proxyAddress);
    }
    async changeProxyAdmin(proxyAddress, newAdmin) {
        Logger_1.Loggy.spin(__filename, 'changeProxyAdmin', `change-proxy-admin`, `Changing admin for proxy ${proxyAddress} to ${newAdmin}`);
        const proxy = Proxy_1.default.at(proxyAddress, this.txParams);
        await proxy.changeAdmin(newAdmin);
        Logger_1.Loggy.succeed('change-proxy-admin', `Admin for proxy ${proxyAddress} set to ${newAdmin}`);
        return proxy;
    }
    async getAdminAddress() {
        if (this.txParams.from)
            return new Promise(resolve => resolve(this.txParams.from));
        else
            return ZWeb3_1.default.defaultAccount();
    }
}
exports.default = SimpleProject;
//# sourceMappingURL=SimpleProject.js.map