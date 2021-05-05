import { CommandModule } from "yargs"
import { ContractMetadata, fetchConfiguration, fetchMetadata, Metadata } from "../util/metadata"
import { getProvider, Layer } from "../util/provider"
import { getStageName } from "../util/stage"
import { cat, find } from "shelljs"
import { join } from "path"
import { Contract } from "@ethersproject/contracts"
import { formatArray, formatProperty, formatTitle } from "../util/format"
import chalk from "chalk"

interface ContractInfo {
    key: string
    metadata: ContractMetadata
}

function findContractInfo(metadata: Metadata, layer: Layer, contractAddress: string): ContractInfo | null {
    const layerSection = layer === Layer.Layer1 ? metadata.layers.layer1.contracts : metadata.layers.layer2.contracts
    for (const [key, metadata] of Object.entries(layerSection)) {
        if (metadata.address.toLowerCase() === contractAddress.toLowerCase()) {
            return { key, metadata }
        }
    }
    return null
}

function getContractModulePath() {
    // if typescript compiles to javascript file, it will be in build directory
    // which is one more layer than typescript, so add one more '..' to upper level
    const jsMode = __filename.includes(".js")
    const paths = jsMode
        ? [__dirname, "..", "..", "..", "node_modules", "@perp", "contract", "build", "contracts"]
        : [__dirname, "..", "..", "node_modules", "@perp", "contract", "build", "contracts"]

    return join(...paths)
}

const verifyCommand: CommandModule = {
    command: "verify <address> <data>",
    describe: "verify a function data for certain address",
    builder: yargs =>
        yargs
            .number("layer")
            .alias("layer", ["l"])
            .describe("layer", "the layer for the contract address to verify")
            .default("layer", 2)
            .positional("address", {
                describe: "contract address",
                type: "string",
            })
            .positional("data", {
                describe: "function data to verify",
                type: "string",
            }),
    handler: async argv => {
        const address = argv.address as string
        const data = argv.data as string
        const stageName = getStageName()
        const config = await fetchConfiguration(stageName)
        const metadata = await fetchMetadata(stageName)
        const layer = argv.layer === 2 ? Layer.Layer2 : Layer.Layer1
        const provider = getProvider(layer, config)
        const contractInfo = findContractInfo(metadata, layer, address)

        if (!contractInfo) {
            throw new Error("contract address not found")
        }

        const contractModulePath = getContractModulePath()
        const [artifactPath] = find(contractModulePath).filter(filename =>
            filename.includes(`${contractInfo.metadata.name}.json`),
        )
        const artifact = JSON.parse(cat(artifactPath))
        const contract = new Contract(address, artifact.abi, provider)
        const txInfo = contract.interface.parseTransaction({ data })
        console.log(formatTitle(`Contract ${contractInfo.key} (${contractInfo.metadata.name})`))
        console.log(formatProperty("function name", txInfo.functionFragment.name))
        console.log(chalk.yellow("- args:"))
        const args = [...txInfo.args]
        console.log(JSON.stringify(formatArray(args), null, 2))
    },
}

export default verifyCommand
