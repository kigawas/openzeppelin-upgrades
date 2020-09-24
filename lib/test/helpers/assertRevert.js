"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
async function assertRevert(promise, invariants = () => undefined) {
    try {
        await promise;
    }
    catch (error) {
        const revertFound = error.toString().search('revert') >= 0;
        assert_1.default(revertFound, `Expected "revert", got ${error} instead`);
        invariants();
        return;
    }
    assert_1.default.fail('Expected VM revert');
}
exports.default = assertRevert;
//# sourceMappingURL=assertRevert.js.map