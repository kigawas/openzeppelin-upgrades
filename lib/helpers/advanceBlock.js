"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ZWeb3_1 = __importDefault(require("../artifacts/ZWeb3"));
function advanceBlock() {
    return new Promise((resolve, reject) => {
        if (typeof ZWeb3_1.default.provider == 'string') {
            return reject('provider not set');
        }
        ZWeb3_1.default.provider.send({
            jsonrpc: '2.0',
            method: 'evm_mine',
            params: [],
            id: Date.now(),
        }, (err, res) => {
            return err ? reject(err) : resolve(res);
        });
    });
}
exports.default = advanceBlock;
//# sourceMappingURL=advanceBlock.js.map