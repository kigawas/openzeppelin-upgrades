"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BasePackageProject_1 = __importDefault(require("./BasePackageProject"));
const Package_1 = __importDefault(require("../application/Package"));
const DeployError_1 = require("../utils/errors/DeployError");
const Semver_1 = require("../utils/Semver");
class PackageProject extends BasePackageProject_1.default {
    static async fetch(packageAddress, version = '0.1.0', txParams) {
        const thepackage = Package_1.default.fetch(packageAddress, txParams);
        return new this(thepackage, version, txParams);
    }
    // REFACTOR: Evaluate merging this logic with CLI's ProjectDeployer classes
    static async fetchOrDeploy(version = '0.1.0', txParams = {}, { packageAddress } = {}) {
        let thepackage;
        let directory;
        version = Semver_1.semanticVersionToString(version);
        try {
            thepackage = packageAddress ? Package_1.default.fetch(packageAddress, txParams) : await Package_1.default.deploy(txParams);
            directory = (await thepackage.hasVersion(version))
                ? await thepackage.getDirectory(version)
                : await thepackage.newVersion(version);
            const project = new this(thepackage, version, txParams);
            project.directory = directory;
            return project;
        }
        catch (error) {
            throw new DeployError_1.DeployError(error, { thepackage, directory });
        }
    }
    constructor(thepackage, version = '0.1.0', txParams = {}) {
        super(txParams);
        this.package = thepackage;
        this.version = Semver_1.semanticVersionToString(version);
    }
    async getImplementation({ contractName }) {
        const directory = await this.getCurrentDirectory();
        return directory.getImplementation(contractName);
    }
    async getProjectPackage() {
        return this.package;
    }
    async getCurrentDirectory() {
        if (!this.directory) {
            const thepackage = await this.getProjectPackage();
            this.directory = await thepackage.getDirectory(this.version);
        }
        return this.directory;
    }
    async getCurrentVersion() {
        return this.version;
    }
}
exports.default = PackageProject;
//# sourceMappingURL=PackageProject.js.map