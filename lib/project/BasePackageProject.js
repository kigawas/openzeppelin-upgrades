"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transactions_1 = __importDefault(require("../utils/Transactions"));
const Logger_1 = require("../utils/Logger");
const Semver_1 = require("../utils/Semver");
class BasePackageProject {
    constructor(txParams) {
        this.txParams = txParams;
    }
    async newVersion(version) {
        const thepackage = await this.getProjectPackage();
        const directory = await thepackage.newVersion(version);
        this.directory = directory;
        this.version = Semver_1.semanticVersionToString(version);
        return directory;
    }
    // TODO: Testme
    async freeze() {
        const version = await this.getCurrentVersion();
        Logger_1.Loggy.spin(__filename, 'freeze', `freezing-version`, `Freezing version ${version}`);
        const directory = await this.getCurrentDirectory();
        await directory.freeze();
        Logger_1.Loggy.succeed(`freezing-version`, `Version ${version} has been frozen`);
    }
    async setImplementation(contract, contractName) {
        if (!contractName)
            contractName = contract.schema.contractName;
        Logger_1.Loggy.onVerbose(__filename, 'setImplementation', `set-implementation-${contractName}`, `Setting implementation of ${contractName} in directory`);
        const implementation = await Transactions_1.default.deployContract(contract, [], this.txParams);
        const directory = await this.getCurrentDirectory();
        await directory.setImplementation(contractName, implementation.address);
        Logger_1.Loggy.onVerbose(__filename, 'setImplementation', `set-implementation-${contractName}`, `Implementation set: ${implementation.address}`);
        return implementation;
    }
    async unsetImplementation(contractName) {
        Logger_1.Loggy.onVerbose(__filename, 'unsetImplementation', `unset-implementation-${contractName}`, `Unsetting implementation of ${contractName}`);
        const directory = await this.getCurrentDirectory();
        await directory.unsetImplementation(contractName);
        Logger_1.Loggy.onVerbose(__filename, 'unsetImplementation', `unset-implementation-${contractName}`, `Unset implementation: ${contractName}`);
    }
    async registerImplementation(contractName, { address }) {
        Logger_1.Loggy.spin(__filename, 'registerImplementation', `register-implementation-${contractName}`, `Registering ${contractName} at ${address} in directory`);
        const directory = await this.getCurrentDirectory();
        await directory.setImplementation(contractName, address);
        Logger_1.Loggy.succeed(`register-implementation-${contractName}`);
    }
}
exports.default = BasePackageProject;
//# sourceMappingURL=BasePackageProject.js.map