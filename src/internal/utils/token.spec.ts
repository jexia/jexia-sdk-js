import { untilTokenExpired } from "./token";

// Set to the year 2000
const expiredToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0IFRva2VuIiwiaWF0Ijo5NzYyODUzMDQsImV4cCI6OTc2Mjg1MzA0LCJhdWQiOiJ3d3cuamV4aWEuY29tIiwic3ViIjoiam9obkBkb2UuY29tIn0.RkxTdiuiIvwvOIVBVqMJt6hpiobz7_FG0aKyE686eE0";
// Set to the year 4000
const futureToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0IFRva2VuIiwiaWF0Ijo2NDA5MDE4OTMwNCwiZXhwIjo2NDA5MDE4OTMwNCwiYXVkIjoid3d3LmpleGlhLmNvbSIsInN1YiI6ImpvaG5AZG9lLmNvbSJ9.qXp8xLcaA0RrnVg097K49p6FGax5HQAQ8NcutpKpA0w";

describe("getting time until token expired", () => {
  it("should return '0' when the token got expired", () => {
    const time = untilTokenExpired(expiredToken)
    expect(time).toBe(0);
  });

  it("should return time until the token got expired", () => {
    const time = untilTokenExpired(futureToken);
    expect(time).toBeGreaterThan(0);
  });
});
