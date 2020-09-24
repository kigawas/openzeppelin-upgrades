"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ZWeb3_1 = __importDefault(require("../artifacts/ZWeb3"));
const Addresses_1 = require("../utils/Addresses");
class MinimalProxy {
    constructor(address) {
        this.address = Addresses_1.toAddress(address);
    }
    static at(address) {
        return new this(address);
    }
    async implementation() {
        // Implementation address is in bytes 10-29
        // (see http://eips.ethereum.org/EIPS/eip-1167)
        // We are slicing on the hex representation, hence 2 chars per byte,
        // and have also to account for the initial 0x in the string
        const code = await ZWeb3_1.default.eth.getCode(this.address);
        return `0x${code.slice(22, 62)}`;
    }
}
exports.default = MinimalProxy;
//# sourceMappingURL=MinimalProxy.js.map