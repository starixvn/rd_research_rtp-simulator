import Chance from "chance";

const chance = new Chance();

export const simulateRtp = (
  randomModes: number[],
  numberOfTurnsToRun: number,
  gameData: any,
  generateResult: Function,
  generateResultParams: Function,
  getSettlementResult: Function,
  getSettlementResultParams: Function,
  getOdds: Function,
  updateGameData: Function
) => {
  const BET_CHOICES = {} as any;

  gameData.choices.forEach((choice: string) => {
    BET_CHOICES[choice] = 0;
  });

  const rtp = {} as any;

  randomModes.forEach((randomMode) => {
    gameData["randomMode"] = randomMode;
    const totalWin = { ...BET_CHOICES };
    const totalBet = { ...BET_CHOICES };
    const rtpPerChoice = { ...BET_CHOICES };

    for (let turn = 1; turn <= numberOfTurnsToRun; turn++) {
      const resultParams = generateResultParams(randomMode);
      const result = generateResult(resultParams);
      const settlementParams = getSettlementResultParams(result);
      const settlementResult = getSettlementResult(settlementParams);
      updateGameData(gameData, result, settlementResult, turn);
      const betOdds = getOdds(settlementResult, result, gameData);
      const betAmount = {} as any;

      gameData.choices.forEach((choice: string) => {
        betAmount[choice] = chance.integer({ min: 10, max: 1000 });
      });

      gameData.choices.forEach((choice: string) => {
        if (settlementResult[choice]) {
          totalWin[choice] += betAmount[choice] * betOdds[choice];
        }

        totalBet[choice] += betAmount[choice];
      });
    }

    gameData.choices.forEach((choice: string) => {
      rtpPerChoice[choice] = totalWin[choice] / totalBet[choice];
    });

    rtp[`randomMode${randomMode}`] = rtpPerChoice;
  });

  return rtp;
};
