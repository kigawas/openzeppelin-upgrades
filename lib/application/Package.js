"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../utils/Logger");
const Contracts_1 = __importDefault(require("../artifacts/Contracts"));
const ImplementationDirectory_1 = __importDefault(require("../application/ImplementationDirectory"));
const Semver_1 = require("../utils/Semver");
const Addresses_1 = require("../utils/Addresses");
const Transactions_1 = __importDefault(require("../utils/Transactions"));
class Package {
    constructor(packageContract, txParams = {}) {
        this.packageContract = packageContract;
        this.txParams = txParams;
    }
    static fetch(address, txParams = {}) {
        if (Addresses_1.isZeroAddress(address))
            return null;
        const PackageContact = Contracts_1.default.getFromLib('Package');
        const packageContract = PackageContact.at(address);
        return new this(packageContract, txParams);
    }
    static async deploy(txParams = {}) {
        const PackageContract = Contracts_1.default.getFromLib('Package');
        const packageContract = await Transactions_1.default.deployContract(PackageContract, [], txParams);
        Logger_1.Loggy.onVerbose(__filename, 'deploy', `deployed-package-${packageContract.address}`, `Deployed Package ${packageContract.address}`);
        return new this(packageContract, txParams);
    }
    get contract() {
        return this.packageContract;
    }
    get address() {
        return this.packageContract.address;
    }
    async hasVersion(version) {
        return this.packageContract.methods.hasVersion(Semver_1.toSemanticVersion(version)).call();
    }
    async isFrozen(version) {
        const directory = await this.getDirectory(version);
        return directory.isFrozen();
    }
    async freeze(version) {
        const directory = await this.getDirectory(version);
        if (!directory.freeze)
            throw Error('Implementation directory does not support freezing');
        return directory.freeze();
    }
    async getImplementation(version, contractName) {
        const directory = await this.getDirectory(version);
        return directory.getImplementation(contractName);
    }
    async newVersion(version, content = '') {
        const semver = Semver_1.toSemanticVersion(version);
        const directory = await ImplementationDirectory_1.default.deploy(Object.assign({}, this.txParams));
        await Transactions_1.default.sendTransaction(this.packageContract.methods.addVersion, [semver, directory.address, Buffer.from(content)], Object.assign({}, this.txParams));
        return directory;
    }
    async getDirectory(version) {
        if (!version)
            throw Error('Cannot get a directory from a package without specifying a version');
        const directoryAddress = await this.packageContract.methods.getContract(Semver_1.toSemanticVersion(version)).call();
        return ImplementationDirectory_1.default.fetch(directoryAddress, Object.assign({}, this.txParams));
    }
}
exports.default = Package;
//# sourceMappingURL=Package.js.map