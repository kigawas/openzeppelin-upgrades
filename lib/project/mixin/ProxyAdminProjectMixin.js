"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// A mixin that adds ProxyAdmin field and related ProxyAdminProject methods
// Intented to as a building block for Project class
// Can't extend contructor at that moment due to TypeScript limitations https://github.com/Microsoft/TypeScript/issues/14126
function ProxyAdminProjectMixin(Base) {
    return class extends Base {
        async transferAdminOwnership(newAdminOwner) {
            await this.proxyAdmin.transferOwnership(newAdminOwner);
        }
        async changeProxyAdmin(proxyAddress, newAdmin) {
            return this.proxyAdmin.changeProxyAdmin(proxyAddress, newAdmin);
        }
    };
}
exports.default = ProxyAdminProjectMixin;
//# sourceMappingURL=ProxyAdminProjectMixin.js.map