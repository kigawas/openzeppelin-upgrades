"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ContractAST_1 = __importDefault(require("../utils/ContractAST"));
let ETHEREUM_PACKAGE_CONTRACTS = '@openzeppelin/contracts-ethereum-package/';
function importsEthereumPackageContracts(contract, buildArtifacts) {
    const ast = new ContractAST_1.default(contract, buildArtifacts, { nodesFilter: [] });
    const illegalImports = [...ast.getImports()]
        .filter(i => i.startsWith(ETHEREUM_PACKAGE_CONTRACTS))
        .map(i => i.slice(ETHEREUM_PACKAGE_CONTRACTS.length))
        .map(i => i.replace(/^contracts\//, ''));
    return illegalImports.length > 0 ? illegalImports : undefined;
}
exports.importsEthereumPackageContracts = importsEthereumPackageContracts;
// Used for testing purposes;
function setEthereumPackageContractsPackageName(value) {
    ETHEREUM_PACKAGE_CONTRACTS = value;
}
exports.setEthereumPackageContractsPackageName = setEthereumPackageContractsPackageName;
//# sourceMappingURL=VanillaContracts.js.map