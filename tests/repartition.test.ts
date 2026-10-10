import {
  calculateRepartition,
  scaleLockedRepartition,
} from "../utils/repartition";

describe("custom expense splits", () => {
  it("scales a complete custom split when the expense total changes", () => {
    const scaled = scaleLockedRepartition(
      { alice: 30, bob: 70 },
      100,
      250,
      true,
    );

    expect(scaled).toEqual({ alice: 75, bob: 175 });
    expect(calculateRepartition(["alice", "bob"], 250, scaled)).toEqual({
      montants: { alice: 75, bob: 175 },
      error: null,
    });
  });

  it("keeps the scaled total exact despite cent rounding", () => {
    const scaled = scaleLockedRepartition(
      { alice: 11.11, bob: 18.89 },
      30,
      100,
      true,
    );

    expect(scaled).toEqual({ alice: 37.03, bob: 62.97 });
    expect(calculateRepartition(["alice", "bob"], 100, scaled).error).toBeNull();
  });

  it("leaves an unlocked share available when only one amount was customised", () => {
    const scaled = scaleLockedRepartition({ alice: 30 }, 100, 250);

    expect(scaled).toEqual({ alice: 75 });
    expect(calculateRepartition(["alice", "bob"], 250, scaled)).toEqual({
      montants: { alice: 75, bob: 175 },
      error: null,
    });
  });
});
