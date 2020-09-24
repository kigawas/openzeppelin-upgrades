"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../utils/Logger");
const ProxyAdmin_1 = __importDefault(require("../proxy/ProxyAdmin"));
const BaseSimpleProject_1 = __importDefault(require("./BaseSimpleProject"));
const ProxyFactory_1 = __importDefault(require("../proxy/ProxyFactory"));
const ProxyAdminProjectMixin_1 = __importDefault(require("./mixin/ProxyAdminProjectMixin"));
class BaseProxyAdminProject extends BaseSimpleProject_1.default {
    constructor(name = 'main', proxyAdmin, proxyFactory, txParams = {}) {
        super(name, proxyFactory, txParams);
        this.proxyAdmin = proxyAdmin;
    }
    static async fetch(name = 'main', txParams = {}, proxyAdminAddress, proxyFactoryAddress) {
        const proxyAdmin = proxyAdminAddress ? await ProxyAdmin_1.default.fetch(proxyAdminAddress, txParams) : null;
        const proxyFactory = proxyFactoryAddress ? await ProxyFactory_1.default.fetch(proxyFactoryAddress, txParams) : null;
        return new ProxyAdminProject(name, proxyAdmin, proxyFactory, txParams);
    }
    async createProxy(contract, contractParams = {}) {
        if (!contractParams.admin)
            await this.ensureProxyAdmin();
        return super.createProxy(contract, contractParams);
    }
    async createProxyWithSalt(contract, salt, signature, contractParams = {}) {
        if (!contractParams.admin)
            await this.ensureProxyAdmin();
        return super.createProxyWithSalt(contract, salt, signature, contractParams);
    }
    async upgradeProxy(proxyAddress, contract, contractParams = {}) {
        const { initMethod: initMethodName, initArgs } = contractParams;
        const { implementationAddress, pAddress: checkedProxyAddress } = await this._setUpgradeParams(proxyAddress, contract, contractParams);
        Logger_1.Loggy.spin(__filename, 'upgradeProxy', `action-proxy-${checkedProxyAddress}`, `Upgrading instance at ${checkedProxyAddress}`);
        const receipt = await this.proxyAdmin.upgradeProxy(checkedProxyAddress, implementationAddress, contract, initMethodName, initArgs);
        Logger_1.Loggy.succeed(`action-proxy-${checkedProxyAddress}`, `Instance at ${checkedProxyAddress} upgraded`);
        return receipt;
    }
    getAdminAddress() {
        return new Promise(resolve => resolve(this.proxyAdmin ? this.proxyAdmin.address : null));
    }
    async ensureProxyAdmin() {
        if (!this.proxyAdmin) {
            this.proxyAdmin = await ProxyAdmin_1.default.deploy(this.txParams);
        }
        return this.proxyAdmin;
    }
}
// Mixings produce value but not type
// We have to export full class with type & callable
class ProxyAdminProject extends ProxyAdminProjectMixin_1.default(BaseProxyAdminProject) {
}
exports.default = ProxyAdminProject;
//# sourceMappingURL=ProxyAdminProject.js.map