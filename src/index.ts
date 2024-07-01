#! /usr/bin/env node --experimental-loader=extensionless
import figlet from "figlet";
import { Command } from "commander";
import { simulateRtp } from "./rtp-simulator";
import path from "path";

const program = new Command();

console.info(figlet.textSync("RTP Simulator"));

program
  .name("RTP Simulator")
  .version("0.0.1", "-v, --version", "output the current version")
  .description("RTP Simulator tool to estimate RTP");

program
  .command("run-with-files")
  .description("Run simulating with files")
  .requiredOption("-c, --configuration <file-config>", "file configuration for rtp simulator")
  .action(async (options) => {
    await calculateRTP(options.configuration);
  });

program
  .command("run-with-source")
  .description("Run simulating with game service source")
  .argument("[config.t|js]", "additional config (optional)")
  .requiredOption("-t, --type <number>", "type of game service")
  .action((helper, gameSettings, constant, options) => {
    const type = options.type ? options.type : undefined;
    if (type) {
      console.log(type);
    }
    calculateRTP(helper);
  });

program.parse();

async function calculateRTP(configuration: string) {
  try {
    console.time("time");
    console.log("starting simulation");

    const configs = await import(`${path.resolve(configuration)}`);

    const resultHelper = await import(`${path.resolve(configs.default.resultHelper)}`);

    const rtp = simulateRtp({
      simulateSettings: configs.default,
      generateResult: resultHelper.generateResult,
      getSettlementResult: resultHelper.getSettlementResult,
      getOdds: resultHelper.getOdds,
      updateGameData: resultHelper.updateGameData,
    });

    console.log(rtp);
    console.timeEnd("time");
  } catch (error) {
    console.error("Error loading configuration:", error);
  }
}
