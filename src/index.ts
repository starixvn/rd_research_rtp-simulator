#! /usr/bin/env node

import figlet from "figlet";
import { Command } from "commander";
import fs from "fs";
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
  .argument("<resultHelper.t|js>", "resultHelper of game service (required)")
  .argument("<gameSettings.t|js>", "gameSettings of game service (required)")
  .argument("[constant.t|js]", "constant of game service (optional)")
  .requiredOption("-t, --type <number>", "type of game service")
  .action((helper, gameSettings, constant, options) => {
    const type = options.type ? options.type : undefined;
    if (type) {
      console.log(type);
    }
    calculateRTP(helper, gameSettings, constant);
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
    calculateRTP(helper, gameSettings, constant);
  });

program.parse();

function calculateRTP(helper: string, gameSettings: string, constant: string) {
  console.log("calculating RTP");
  console.log(helper + gameSettings + constant);
}
