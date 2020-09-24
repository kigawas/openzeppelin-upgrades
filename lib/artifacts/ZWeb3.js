"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../utils/Logger");
const web3_1 = __importDefault(require("web3"));
const web3_utils_1 = require("web3-utils");
// Reference: see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md#list-of-chain-ids
exports.NETWORKS = {
    1: 'mainnet',
    2: 'morden',
    3: 'ropsten',
    4: 'rinkeby',
    5: 'goerli',
    42: 'kovan',
};
// TS-TODO: Review what could be private in this class.
class ZWeb3 {
    static initialize(provider, web3Options = {}) {
        ZWeb3.provider = provider;
        ZWeb3.web3instance = undefined;
        ZWeb3.web3Options = web3Options;
    }
    static get web3() {
        var _a;
        if (ZWeb3.web3instance === undefined) {
            ZWeb3.web3instance = new web3_1.default((_a = ZWeb3.provider, (_a !== null && _a !== void 0 ? _a : null)));
            const { blockTimeout, pollingTimeout } = ZWeb3.web3Options;
            if (blockTimeout)
                ZWeb3.web3instance.eth.transactionBlockTimeout = blockTimeout;
            if (pollingTimeout)
                ZWeb3.web3instance.eth.transactionPollingTimeout = pollingTimeout;
        }
        return ZWeb3.web3instance;
    }
    static async checkNetworkId(providedNetworkId) {
        const networkId = await ZWeb3.getNetwork();
        if (providedNetworkId !== undefined &&
            providedNetworkId !== '*' &&
            Number(networkId) !== Number(providedNetworkId)) {
            throw Error(`Unexpected network ID: requested ${providedNetworkId} but connected to ${networkId}`);
        }
    }
    static get eth() {
        return ZWeb3.web3.eth;
    }
    static get version() {
        return ZWeb3.web3.version;
    }
    static async defaultAccount() {
        return (await ZWeb3.eth.getAccounts())[0];
    }
    static toChecksumAddress(address) {
        if (!address)
            return null;
        if (address.match(/[A-F]/)) {
            if (web3_utils_1.toChecksumAddress(address) !== address) {
                throw Error(`Given address \"${address}\" is not a valid Ethereum address or it has not been checksummed correctly.`);
            }
            else {
                return address;
            }
        }
        else {
            Logger_1.Loggy.noSpin.warn(__filename, 'toChecksumAddress', 'checksum-addresses', `WARNING: Address ${address} is not checksummed. Consider checksumming it to avoid future warnings or errors.`);
            return web3_utils_1.toChecksumAddress(address);
        }
    }
    static async hasBytecode(address) {
        const bytecode = await ZWeb3.eth.getCode(address);
        return bytecode.length > 2;
    }
    static async isGanacheNode() {
        const nodeVersion = await ZWeb3.eth.getNodeInfo();
        return nodeVersion.match(/TestRPC/) !== null;
    }
    static async getLatestBlock() {
        return ZWeb3.eth.getBlock('latest');
    }
    static async getLatestBlockNumber() {
        return (await ZWeb3.getLatestBlock()).number;
    }
    static async isMainnet() {
        return (await ZWeb3.getNetworkName()) === 'mainnet';
    }
    static async getNetwork() {
        return ZWeb3.eth.net.getId();
    }
    static async getNetworkName() {
        const networkId = await ZWeb3.getNetwork();
        return exports.NETWORKS[networkId] || `dev-${networkId}`;
    }
}
exports.default = ZWeb3;
ZWeb3.web3Options = {};
//# sourceMappingURL=ZWeb3.js.map