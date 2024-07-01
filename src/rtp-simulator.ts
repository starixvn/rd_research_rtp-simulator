import Chance from "chance";

const chance = new Chance();

export type SimulateParams = {
  simulateSettings: SimulateSettings;
  generateResult: Function;
  getSettlementResult: Function;
  getOdds: Function;
  updateGameData: Function;
};

export type SimulateSettings = {
  gameType: number;
  gameSettings: any;
  randomModes: number[];
  numberOfTurnsToRun: number;
};

/**
 *
 * @param {Object} dependencies
 * @param {Object} dependencies.simulateSettings (required)
 * @param {Function} dependencies.generateResult (required)
 * @param {Function} dependencies.getSettlementResult (required)
 * @param {Function} dependencies.getOdds (optional)
 * @param {Function} dependencies.updateGameData (optional)
 */
export const simulateRtp = ({
  simulateSettings,
  generateResult,
  getSettlementResult,
  getOdds,
  updateGameData,
}: SimulateParams) => {
  const BET_CHOICES = {} as any;
  simulateSettings.gameSettings.choices.forEach((choice: string) => {
    BET_CHOICES[choice] = 0;
  });

  const rtp = {} as any;
  const gameData = {} as any;
  gameData.gameSettings = { ...simulateSettings.gameSettings };

  simulateSettings.randomModes.forEach((randomMode) => {
    gameData["randomMode"] = randomMode;
    const totalWin = { ...BET_CHOICES };
    const totalBet = { ...BET_CHOICES };
    const rtpPerChoice = { ...BET_CHOICES };

    for (let turn = 1; turn <= simulateSettings.numberOfTurnsToRun; turn++) {
      const result = generateResult(randomMode);
      const settlementResult = getSettlementResult(result);

      updateGameData && updateGameData(gameData, result, settlementResult, turn);

      const betOdds = getOdds ? getOdds(settlementResult, result, gameData) : simulateSettings.gameSettings.odds;
      const betAmount = {} as any;

      gameData.gameSettings.choices.forEach((choice: string) => {
        betAmount[choice] = chance.integer({ min: 10, max: 1000 });
      });

      gameData.gameSettings.choices.forEach((choice: string) => {
        if (settlementResult[choice]) {
          totalWin[choice] += betAmount[choice] * betOdds[choice];
        }

        totalBet[choice] += betAmount[choice];
      });
    }

    gameData.gameSettings.choices.forEach((choice: string) => {
      rtpPerChoice[choice] = totalWin[choice] / totalBet[choice];
    });

    rtp[`randomMode${randomMode}`] = rtpPerChoice;
  });

  return rtp;
};
