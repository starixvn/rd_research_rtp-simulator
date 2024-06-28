import { SeedHelper, ServerSeedHelper } from "sc-game-base/src/core/helpers";
import { generateRemainingBalls } from "sc-number-game-base/dist/helpers";
import { Utils } from "@rd/numbers-game-probabilities";
import Chance from "chance";
import { simulateRtp } from "../rtp-simulator";
import { random } from "mathjs";
import { generateRandomNumbers } from "../helper/helper";

const chance = new Chance();

const randomModes = [1, 2, 3];
const gameData = {
  choices: ["big", "small", "specific1", "specific2", "specific3", "specific4", "specific5", "specific6"],
  odds: {
    big: 1.96,
    small: 1.96,
    single: 2,
    double: 3.5,
    triple: 6,
  },
};

function generateSeed(): string {
  return chance.ssn({ ssnFour: true });
}

const generateResult = (finalSeeds: any) => {
  const serverSeed = JSON.parse(finalSeeds.serverSeed);

  const remainingBalls = serverSeed.remain.split(":").map((ball: string) => +ball);

  const randomIndexes = serverSeed.random.split(";").map((ballIndex: string) => +ballIndex) as number[];

  const increments = finalHashToNumbers(finalSeeds.finalHash);

  const totalRemainingBalls = remainingBalls.length;

  const ballIndexes = randomIndexes.map(
    (randomValue, index) => (randomValue + increments[index]) % (totalRemainingBalls - index)
  );

  const currentRemainingBalls: number[] = remainingBalls;

  const balls: number[] = [];

  ballIndexes.forEach((index) => {
    balls.push(currentRemainingBalls[index]);
    currentRemainingBalls.splice(index, 1);
  });

  return { balls };
};

const generateServerSeed = (gameData: any) => {
  const TOTAL_BALLS = 60;
  const BALLS_EACH_DRAW = 3;
  const SERVER_SEED_SECRET_LENGTH = 32;
  const { randomMode } = gameData.gameConfigs;
  const { roundResult } = gameData;

  const drawn = (roundResult as any)
    .map((res: any) => res.balls)
    .flat()
    .map((ball: any) => +ball);

  const totalRemainingBalls = TOTAL_BALLS - drawn.length;

  const randomBalls = generateRandomNumbers(randomMode, BALLS_EACH_DRAW, totalRemainingBalls).join(";");

  const remainingBalls = generateRemainingBalls(TOTAL_BALLS, drawn).join(":");

  const serverSeedSecret = ServerSeedHelper.generateServerSeed(randomMode, SERVER_SEED_SECRET_LENGTH);

  return `{"random":"${randomBalls}","remain":"${remainingBalls}","secret":"${serverSeedSecret}"}`;
};

const generateResultParams = (gameData: any) => {
  const serverSeed = generateServerSeed(gameData);

  const numberOfClients = chance.integer({ min: 0, max: 20 });
  let mergeClientSeed = "";
  for (let i = 0; i < numberOfClients; i++) {
    mergeClientSeed += generateSeed();
  }

  const mergeSeed = serverSeed + mergeClientSeed;
  const finalHash = SeedHelper.getSHA512Hash(mergeSeed);

  return { finalHash, serverSeed };
};

const finalHashToNumbers = (finalHash: string) => {
  const BALLS_EACH_ROUND = 3;
  const increments = [];
  for (let i = 0; i < BALLS_EACH_ROUND; i++) {
    const value = parseInt(finalHash.slice(i * 2, i * 2 + 2), 16);
    increments.push(value);
  }
  return increments;
};

const getTotalReds = (balls: number[]) => [...balls].filter((ball) => +ball % 2 === 0).length;

const getSettlementResult = (result: any) => {
  const MEDIAN = 92;
  const sum = Utils.getSum(result.balls);
  const over = sum >= MEDIAN;
  const totalReds = getTotalReds(result.balls);

  return {
    over,
    under: !over,
    red2: totalReds === 2,
    red3: totalReds === 3,
    blue2: totalReds === 1,
    blue3: totalReds === 0,
  };
};

const getSettlementResultParams = (result: any) => {
  return result;
};

const calculateAndReturnOdds = (
  settlementDrawResult: Record<string, boolean>,
  resultBalls: number[],
  betOdds: Record<string, number>
) => {
  const odds = { ...settlementDrawResult } as any;
  const SPECIFIC_CHOICE_MAPPER = {
    specific1: 1,
    specific2: 2,
    specific3: 3,
    specific4: 4,
    specific5: 5,
    specific6: 6,
  } as any;

  const SPECIFIC_ODDS_MAPPER = {
    1: "single",
    2: "double",
    3: "triple",
  } as any;

  Object.keys(odds).forEach((choice) => {
    if (isSpecificChoice(choice)) {
      const specificMapperKey = resultBalls.filter((ball) => ball === SPECIFIC_CHOICE_MAPPER[choice]).length;
      const specificOddsType = settlementDrawResult[choice] ? SPECIFIC_ODDS_MAPPER[specificMapperKey] : null;
      odds[choice] = specificOddsType ? betOdds[specificOddsType] : 0;
    } else {
      odds[choice] = betOdds[choice];
    }
  });

  return odds;
};

const isSpecificChoice = (choice: string) => {
  return choice.includes("specific");
};
const getOdds = (settlementDrawResult: any, result: any, gameData: any) => {
  return calculateAndReturnOdds(settlementDrawResult, result.balls, gameData.odds);
};

const updateGameData = (gameData: any, result: any, settlementResult: any, turn: number) => {};

const rtp = simulateRtp(
  randomModes,
  100_000,
  gameData,
  generateResult,
  generateResultParams,
  getSettlementResult,
  getSettlementResultParams,
  getOdds,
  updateGameData
);

console.log(rtp);
