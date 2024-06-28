import { SeedHelper, ServerSeedHelper } from "sc-game-base/src/core/helpers";
import { getRandomIndex } from "sc-number-game-base/dist/helpers";
import { Utils } from "@rd/numbers-game-probabilities";
import Chance from "chance";

const chance = new Chance();

export const gameData = {
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

export const generateResult = (finalSeeds: any) => {
  const TOTAL_BALLS = 6;

  const serverSeed = JSON.parse(finalSeeds.serverSeed);

  const random = serverSeed.random.split(";").map((x: string) => +x) as number[];

  const increments = finalHashToNumbers(finalSeeds.finalHash);

  const balls = random.map((ball, index) => ((ball + increments[index]) % TOTAL_BALLS) + 1);

  return { balls };
};

export const generateResultParams = (randomMode: number) => {
  const BALLS_EACH_ROUND = 3;
  const TOTAL_BALLS = 6;
  const SERVER_SEED_SECRET_LENGTH = 32;
  const randomBalls = [];
  for (let i = 0; i < BALLS_EACH_ROUND; i++) {
    randomBalls.push(getRandomIndex(randomMode, TOTAL_BALLS));
  }

  const serverSeedSecret = ServerSeedHelper.generateServerSeed(randomMode, SERVER_SEED_SECRET_LENGTH);

  const serverSeed = `{"random":"${randomBalls.join(";")}","secret":"${serverSeedSecret}"}`;

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

export const getSettlementResult = (result: any) => {
  const BIG_BEGIN = 11;
  const sum = Utils.getSum(result.balls);
  const big = sum >= BIG_BEGIN;

  return {
    big: big,
    small: !big,
    specific1: result.balls.includes(1),
    specific2: result.balls.includes(2),
    specific3: result.balls.includes(3),
    specific4: result.balls.includes(4),
    specific5: result.balls.includes(5),
    specific6: result.balls.includes(6),
  };
};

export const getSettlementResultParams = (result: any) => {
  return result;
};

export const calculateAndReturnOdds = (
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

export const getOdds = (settlementDrawResult: any, result: any, gameData: any) => {
  return calculateAndReturnOdds(settlementDrawResult, result.balls, gameData.odds);
};

export const updateGameData = (gameData: any, result: any, settlementResult: any, turn: number) => {};
