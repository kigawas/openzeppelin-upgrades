"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const App_1 = __importDefault(require("../application/App"));
const Package_1 = __importDefault(require("../application/Package"));
const ProxyAdmin_1 = __importDefault(require("../proxy/ProxyAdmin"));
const ProxyAdminProjectMixin_1 = __importDefault(require("./mixin/ProxyAdminProjectMixin"));
const BasePackageProject_1 = __importDefault(require("./BasePackageProject"));
const DeployError_1 = require("../utils/errors/DeployError");
const Semver_1 = require("../utils/Semver");
const ProxyFactory_1 = __importDefault(require("../proxy/ProxyFactory"));
const ABIs_1 = require("../utils/ABIs");
const Logger_1 = require("../utils/Logger");
const DEFAULT_NAME = 'main';
const DEFAULT_VERSION = '0.1.0';
class BaseAppProject extends BasePackageProject_1.default {
    constructor(app, name = DEFAULT_NAME, version = DEFAULT_VERSION, proxyAdmin, proxyFactory, txParams = {}) {
        super(txParams);
        this.app = app;
        this.name = name;
        this.proxyAdmin = proxyAdmin;
        this.proxyFactory = proxyFactory;
        this.version = Semver_1.semanticVersionToString(version);
        this.txParams = txParams;
    }
    // REFACTOR: Evaluate merging this logic with CLI's ProjectDeployer classes
    static async fetchOrDeploy(name = DEFAULT_NAME, version = DEFAULT_VERSION, txParams = {}, { appAddress, packageAddress, proxyAdminAddress, proxyFactoryAddress } = {}) {
        let thepackage;
        let directory;
        let app;
        version = Semver_1.semanticVersionToString(version);
        try {
            if (appAddress) {
                app = await App_1.default.fetch(appAddress, txParams);
            }
            else {
                Logger_1.Loggy.spin(__filename, 'fetchOrDeploy', `publish-project`, 'Preparing everything to publish the project. Deploying new App contract');
                app = await App_1.default.deploy(txParams);
            }
            if (packageAddress) {
                thepackage = Package_1.default.fetch(packageAddress, txParams);
            }
            else if (await app.hasPackage(name, version)) {
                thepackage = (await app.getPackage(name)).package;
            }
            else {
                Logger_1.Loggy.spin(__filename, 'fetchOrDeploy', `publish-project`, 'Deploying new Package contract');
                thepackage = await Package_1.default.deploy(txParams);
            }
            if (await thepackage.hasVersion(version)) {
                directory = await thepackage.getDirectory(version);
            }
            else {
                Logger_1.Loggy.spin(__filename, 'fetchOrDeploy', `publish-project`, `Adding new version ${version} and creating ImplementationDirectory contract`);
                directory = await thepackage.newVersion(version);
                const succeedText = !appAddress || !packageAddress ? `Project structure deployed` : `Version ${version} deployed`;
                Logger_1.Loggy.succeed(`publish-project`, succeedText);
            }
            if (!(await app.hasPackage(name, version)))
                await app.setPackage(name, thepackage.address, version);
            const proxyAdmin = proxyAdminAddress
                ? await ProxyAdmin_1.default.fetch(proxyAdminAddress, txParams)
                : null;
            const proxyFactory = ProxyFactory_1.default.tryFetch(proxyFactoryAddress, txParams);
            const project = new AppProject(app, name, version, proxyAdmin, proxyFactory, txParams);
            project.directory = directory;
            project.package = thepackage;
            return project;
        }
        catch (error) {
            throw new DeployError_1.DeployError(error, { thepackage, directory, app });
        }
    }
    // REFACTOR: This code is similar to the ProxyAdminProjectDeployer, consider unifying them
    static async fromProxyAdminProject(proxyAdminProject, version = DEFAULT_VERSION, existingAddresses = {}) {
        const appProject = await this.fetchOrDeploy(proxyAdminProject.name, version, proxyAdminProject.txParams, existingAddresses);
        await Promise.all(lodash_1.concat(lodash_1.map(proxyAdminProject.implementations, (contractInfo, contractName) => appProject.registerImplementation(contractName, contractInfo)), lodash_1.map(proxyAdminProject.dependencies, (dependencyInfo, dependencyName) => appProject.setDependency(dependencyName, dependencyInfo.package, dependencyInfo.version))));
        return appProject;
    }
    // REFACTOR: This code is similar to the SimpleProjectDeployer, consider unifying them
    static async fromSimpleProject(simpleProject, version = DEFAULT_VERSION, existingAddresses = {}) {
        const appProject = await this.fetchOrDeploy(simpleProject.name, version, simpleProject.txParams, existingAddresses);
        await Promise.all(lodash_1.concat(lodash_1.map(simpleProject.implementations, (contractInfo, contractName) => appProject.registerImplementation(contractName, contractInfo)), lodash_1.map(simpleProject.dependencies, (dependencyInfo, dependencyName) => appProject.setDependency(dependencyName, dependencyInfo.package, dependencyInfo.version))));
        return appProject;
    }
    async newVersion(version) {
        version = Semver_1.semanticVersionToString(version);
        const directory = await super.newVersion(version);
        const thepackage = await this.getProjectPackage();
        await this.app.setPackage(this.name, thepackage.address, version);
        return directory;
    }
    getAdminAddress() {
        return new Promise(resolve => resolve(this.proxyAdmin ? this.proxyAdmin.address : null));
    }
    getApp() {
        return this.app;
    }
    async ensureProxyAdmin() {
        if (!this.proxyAdmin) {
            this.proxyAdmin = await ProxyAdmin_1.default.deploy(this.txParams);
        }
        return this.proxyAdmin;
    }
    async ensureProxyFactory() {
        if (!this.proxyFactory) {
            this.proxyFactory = await ProxyFactory_1.default.deploy(this.txParams);
        }
        return this.proxyFactory;
    }
    async getProjectPackage() {
        if (!this.package) {
            const packageInfo = await this.app.getPackage(this.name);
            this.package = packageInfo.package;
        }
        return this.package;
    }
    async getCurrentDirectory() {
        if (!this.directory)
            this.directory = await this.app.getProvider(this.name);
        return this.directory;
    }
    async getCurrentVersion() {
        return this.version;
    }
    async getImplementation({ packageName, contractName, contract, }) {
        return this.app.getImplementation(packageName || this.name, contractName || contract.schema.contractName);
    }
    async createProxy(contract, contractInterface = {}) {
        const { contractName, packageName, initMethod, initArgs, admin } = this.getContractInterface(contract, contractInterface);
        const proxyAdmin = admin || (await this.ensureProxyAdmin()).address;
        return this.app.createProxy(contract, packageName, contractName, proxyAdmin, initMethod, initArgs);
    }
    getContractInterface(contract, opts = {}) {
        let { contractName, packageName, initMethod } = opts;
        if (!contractName) {
            contractName = contract.schema.contractName;
        }
        if (!packageName) {
            packageName = this.name;
        }
        if (!lodash_1.isEmpty(opts.initArgs) && !initMethod) {
            initMethod = 'initialize';
        }
        return Object.assign(Object.assign({}, opts), { contractName, packageName, initMethod });
    }
    async createProxyWithSalt(contract, salt, signature, contractInterface = {}) {
        const { contractName, packageName, initMethod, initArgs, admin } = this.getContractInterface(contract, contractInterface);
        const implementationAddress = await this.app.getImplementation(packageName, contractName);
        const initCallData = this.getAndLogInitCallData(contract, initMethod, initArgs, implementationAddress, 'Creating');
        const proxyFactory = await this.ensureProxyFactory();
        const proxyAdmin = admin || (await this.ensureProxyAdmin()).address;
        const proxy = await proxyFactory.createProxy(salt, implementationAddress, proxyAdmin, initCallData, signature);
        Logger_1.Loggy.succeed(`create-proxy`, `Instance created at ${proxy.address}`);
        return contract.at(proxy.address);
    }
    async createMinimalProxy(contract, contractInterface = {}) {
        const { contractName, packageName, initMethod, initArgs } = this.getContractInterface(contract, contractInterface);
        const implementationAddress = await this.app.getImplementation(packageName, contractName);
        const initCallData = this.getAndLogInitCallData(contract, initMethod, initArgs, implementationAddress, 'Creating');
        const proxyFactory = await this.ensureProxyFactory();
        const proxy = await proxyFactory.createMinimalProxy(implementationAddress, initCallData);
        Logger_1.Loggy.succeed(`create-proxy`, `Instance created at ${proxy.address}`);
        return contract.at(proxy.address);
    }
    // REFACTOR: De-duplicate from BaseSimpleProject
    async getProxyDeploymentAddress(salt, sender) {
        const proxyFactory = await this.ensureProxyFactory();
        return proxyFactory.getDeploymentAddress(salt, sender);
    }
    // REFACTOR: De-duplicate from BaseSimpleProject
    async getProxyDeploymentSigner(contract, salt, signature, { packageName, contractName, initMethod, initArgs, admin } = {}) {
        const proxyFactory = await this.ensureProxyFactory();
        const implementationAddress = await this.getImplementation({
            packageName,
            contractName,
            contract,
        });
        if (!implementationAddress)
            throw new Error(`Contract ${contractName ||
                contract.schema.contractName} was not found or is not deployed in the current network.`);
        const adminAddress = admin || (await this.getAdminAddress());
        const initData = initMethod ? ABIs_1.buildCallData(contract, initMethod, initArgs).callData : null;
        return proxyFactory.getSigner(salt, implementationAddress, adminAddress, initData, signature);
    }
    async upgradeProxy(proxyAddress, contract, contractInterface = {}) {
        const { contractName, packageName, initMethod, initArgs } = this.getContractInterface(contract, contractInterface);
        const implementationAddress = await this.getImplementation({
            packageName,
            contractName,
        });
        return this.proxyAdmin.upgradeProxy(proxyAddress, implementationAddress, contract, initMethod, initArgs);
    }
    async getDependencyPackage(name) {
        const packageInfo = await this.app.getPackage(name);
        return packageInfo.package;
    }
    async getDependencyVersion(name) {
        const packageInfo = await this.app.getPackage(name);
        return packageInfo.version;
    }
    async hasDependency(name) {
        return this.app.hasPackage(name);
    }
    async setDependency(name, packageAddress, version) {
        return this.app.setPackage(name, packageAddress, version);
    }
    async unsetDependency(name) {
        return this.app.unsetPackage(name);
    }
    // REFACTOR: Deduplicate from BaseSimpleProject
    getAndLogInitCallData(contract, initMethodName, initArgs, implementationAddress, actionLabel, proxyAddress) {
        const logReference = actionLabel === 'Creating' ? 'create-proxy' : `upgrade-proxy-${proxyAddress}`;
        const logMessage = actionLabel === 'Creating'
            ? `Creating instance for contract at ${implementationAddress}`
            : `Upgrading instance at ${proxyAddress}`;
        if (initMethodName) {
            const { method: initMethod, callData } = ABIs_1.buildCallData(contract, initMethodName, initArgs);
            if (actionLabel)
                Logger_1.Loggy.spin(__filename, 'getAndLogInitCallData', logReference, `${logMessage} and calling ${ABIs_1.callDescription(initMethod, initArgs)}`);
            return callData;
        }
        else {
            if (actionLabel) {
                Logger_1.Loggy.spin(__filename, 'getAndLogInitCallData', logReference, logMessage);
            }
            return null;
        }
    }
}
// Mixings produce value but not type
// We have to export full class with type & callable
class AppProject extends ProxyAdminProjectMixin_1.default(BaseAppProject) {
}
exports.default = AppProject;
//# sourceMappingURL=AppProject.js.map