"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../utils/Logger");
const Transactions_1 = __importDefault(require("../utils/Transactions"));
const Contracts_1 = __importDefault(require("../artifacts/Contracts"));
// TS-TODO: review which members could be private
class ImplementationDirectory {
    constructor(directory, txParams = {}) {
        this.directoryContract = directory;
        this.txParams = txParams;
    }
    static async deploy(txParams = {}) {
        const contract = this.getContract();
        const directory = await Transactions_1.default.deployContract(contract, [], txParams);
        Logger_1.Loggy.onVerbose(__filename, 'deploy', `deployed-implementation-directory`, `Deployed ${contract.schema.contractName} at ${directory.address}`);
        return new this(directory, txParams);
    }
    static fetch(address, txParams = {}) {
        const contract = this.getContract();
        const directory = contract.at(address);
        return new this(directory, txParams);
    }
    static getContract() {
        return Contracts_1.default.getFromLib('ImplementationDirectory');
    }
    get contract() {
        return this.directoryContract;
    }
    get address() {
        return this.directoryContract.address;
    }
    async owner() {
        return this.directoryContract.methods.owner().call(Object.assign({}, this.txParams));
    }
    async getImplementation(contractName) {
        if (!contractName)
            throw Error('Contract name is required to retrieve an implementation');
        return await this.directoryContract.methods.getImplementation(contractName).call(Object.assign({}, this.txParams));
    }
    async setImplementation(contractName, implementationAddress) {
        Logger_1.Loggy.onVerbose(__filename, 'setImplementation', `set-implementation-${contractName}`, `Setting ${contractName} implementation ${implementationAddress} in directory`);
        await Transactions_1.default.sendTransaction(this.directoryContract.methods.setImplementation, [contractName, implementationAddress], Object.assign({}, this.txParams));
        Logger_1.Loggy.succeed(`set-implementation-${contractName}`, `Setting ${contractName} in directory`);
    }
    async unsetImplementation(contractName) {
        Logger_1.Loggy.onVerbose(__filename, 'unsetImplementation', `unset-implementation-${contractName}`, `Unsetting ${contractName} implementation`);
        await Transactions_1.default.sendTransaction(this.directoryContract.methods.unsetImplementation, [contractName], Object.assign({}, this.txParams));
        Logger_1.Loggy.succeed(`unset-implementation-${contractName}`, `${contractName} implementation unset`);
    }
    async freeze() {
        Logger_1.Loggy.spin(__filename, 'freeze', `freeze-implementation`, 'Freezing directory version');
        await Transactions_1.default.sendTransaction(this.directoryContract.methods.freeze, [], Object.assign({}, this.txParams));
        Logger_1.Loggy.succeed(`freeze-implementation`, `Directory version frozen`);
    }
    async isFrozen() {
        return await this.directoryContract.methods.frozen().call();
    }
}
exports.default = ImplementationDirectory;
//# sourceMappingURL=ImplementationDirectory.js.map