import { calculateSavingsCapacity } from "../utils/savingsCapacity";

describe("savings capacity", () => {
  it("uses only real income when there are no savings movements", () => {
    expect(calculateSavingsCapacity(1600, 200, 0)).toBe(1400);
  });

  it("keeps deposits and withdrawals separate from revenue", () => {
    // 1,600 real income - 200 expenses - (+200 - 200 - 100) savings.
    expect(calculateSavingsCapacity(1600, 200, -100)).toBe(1500);
  });

  it("reduces capacity for a deposit without creating new income", () => {
    expect(calculateSavingsCapacity(1600, 200, 200)).toBe(1200);
  });

  it("releases capacity for a withdrawal without creating new income", () => {
    expect(calculateSavingsCapacity(1600, 200, -200)).toBe(1600);
  });
});
