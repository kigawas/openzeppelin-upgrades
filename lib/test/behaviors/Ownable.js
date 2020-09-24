"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const assertRevert_1 = __importDefault(require("../helpers/assertRevert"));
function shouldBehaveLikeOwnable(owner, anotherAccount) {
    describe('owner', function () {
        it('sets the creator as the owner of the contract', async function () {
            const contractOwner = await this.ownable.methods.owner().call();
            assert_1.default.equal(contractOwner, owner);
        });
    });
    describe('transferOwnership', function () {
        describe('when the proposed owner is not the zero address', function () {
            const newOwner = anotherAccount;
            describe('when the sender is the owner', function () {
                const from = owner;
                it('transfers the ownership', async function () {
                    await this.ownable.methods.transferOwnership(newOwner).send({ from });
                    const contractOwner = await this.ownable.methods.owner().call();
                    assert_1.default.equal(contractOwner, anotherAccount);
                });
                it('emits an event', async function () {
                    const { events } = await this.ownable.methods.transferOwnership(newOwner).send({ from });
                    const event = events['OwnershipTransferred'];
                    assert_1.default.equal(event.returnValues.previousOwner, owner);
                    assert_1.default.equal(event.returnValues.newOwner, newOwner);
                });
            });
            describe('when the sender is not the owner', function () {
                const from = anotherAccount;
                it('reverts', async function () {
                    await assertRevert_1.default(this.ownable.methods.transferOwnership(newOwner).send({ from }));
                });
            });
        });
        describe('when the new proposed owner is the zero address', function () {
            const newOwner = '0x0000000000000000000000000000000000000000';
            it('reverts', async function () {
                await assertRevert_1.default(this.ownable.methods.transferOwnership(newOwner).send({ from: owner }));
            });
        });
    });
}
exports.default = shouldBehaveLikeOwnable;
//# sourceMappingURL=Ownable.js.map