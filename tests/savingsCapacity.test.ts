import { calculateSavingsCapacity } from "../utils/savingsCapacity";

describe("savings capacity", () => {
  it("includes a piggy-bank withdrawal because it is persisted as income", () => {
    // 1,500 income + 300 withdrawal - 500 expenses - 200 already saved.
    expect(calculateSavingsCapacity(1800, 500, 200)).toBe(1100);
  });

  it("uses the net persisted movement total", () => {
    // A 300 withdrawal changes movements from +200 to -100.
    expect(calculateSavingsCapacity(1800, 500, -100)).toBe(1400);
  });
});
