"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_generator_1 = require("ts-generator");
const TypeChain_1 = require("typechain/dist/TypeChain");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = process.cwd();
        yield ts_generator_1.tsGenerator({ cwd }, new TypeChain_1.TypeChain({
            cwd,
            rawConfig: {
                files: `${__dirname}/../node_modules/@perp/contract/build/contracts/!(build-info)/**/+([a-zA-Z0-9_]).json`,
                outDir: "src/type",
                target: "ethers-v5",
            },
        }));
    });
}
main().catch(console.error);
