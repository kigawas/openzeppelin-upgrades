"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../utils/Logger");
const Contracts_1 = __importDefault(require("../artifacts/Contracts"));
const Addresses_1 = require("../utils/Addresses");
const Transactions_1 = __importDefault(require("../utils/Transactions"));
const Proxy_1 = __importDefault(require("./Proxy"));
const MinimalProxy_1 = __importDefault(require("./MinimalProxy"));
class ProxyFactory {
    constructor(contract, txParams = {}) {
        this.contract = contract;
        this.address = Addresses_1.toAddress(contract);
        this.txParams = txParams;
    }
    static tryFetch(address, txParams = {}) {
        return address ? this.fetch(address, txParams) : null;
    }
    static fetch(address, txParams = {}) {
        const contract = Contracts_1.default.getFromLib('ProxyFactory').at(address);
        return new this(contract, txParams);
    }
    static async deploy(txParams = {}) {
        Logger_1.Loggy.spin(__filename, 'deploy', 'deploy-proxy-factory', 'Deploying new ProxyFactory contract');
        const contract = await Transactions_1.default.deployContract(Contracts_1.default.getFromLib('ProxyFactory'), [], txParams);
        Logger_1.Loggy.succeed('deploy-proxy-factory', `Deployed ProxyFactory at ${contract.address}`);
        return new this(contract, txParams);
    }
    async createMinimalProxy(logicAddress, initData) {
        const args = [logicAddress, initData || Buffer.from('')];
        const { events, transactionHash } = await Transactions_1.default.sendTransaction(this.contract.methods.deployMinimal, args, Object.assign({}, this.txParams));
        if (!events.ProxyCreated) {
            throw new Error(`Could not retrieve proxy deployment address from transaction ${transactionHash}`);
        }
        const address = events.ProxyCreated.returnValues.proxy;
        return MinimalProxy_1.default.at(address);
    }
    async createProxy(salt, logicAddress, proxyAdmin, initData, signature) {
        const args = [salt, logicAddress, proxyAdmin, initData || Buffer.from('')];
        const method = signature ? this.contract.methods.deploySigned : this.contract.methods.deploy;
        if (signature)
            args.push(signature);
        const { events, transactionHash } = await Transactions_1.default.sendTransaction(method, args, Object.assign({}, this.txParams));
        if (!events.ProxyCreated) {
            throw new Error(`Could not retrieve proxy deployment address from transaction ${transactionHash}`);
        }
        const address = (events.ProxyCreated.returnValues || events.ProxyCreated[0].returnValues).proxy;
        return Proxy_1.default.at(address, this.txParams);
    }
    async getSigner(salt, logicAddress, proxyAdmin, initData, signature) {
        return this.contract.methods
            .getSigner(salt, logicAddress, proxyAdmin, initData || Buffer.from(''), signature)
            .call();
    }
    async getDeploymentAddress(salt, sender) {
        const actualSender = sender || (await this.getDefaultSender());
        return this.contract.methods.getDeploymentAddress(salt, actualSender).call();
    }
    async getDefaultSender() {
        return this.txParams.from || (await Contracts_1.default.getDefaultFromAddress());
    }
}
exports.default = ProxyFactory;
//# sourceMappingURL=ProxyFactory.js.map