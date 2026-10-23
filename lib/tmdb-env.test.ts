import { describe, expect, it } from "vitest";
import {
  isTmdbBearerToken,
  parseEnvFileValue,
  resolveTmdbApiKey,
} from "./tmdb-env";

describe("parseEnvFileValue", () => {
  it("reads an unquoted value and skips comments", () => {
    const contents = `# note\nTMDB_API_KEY=abc123\nOPENAI_API_KEY=skip\n`;
    expect(parseEnvFileValue(contents, "TMDB_API_KEY")).toBe("abc123");
  });

  it("strips quotes and returns undefined when missing", () => {
    expect(parseEnvFileValue(`TMDB_API_KEY="xyz"\n`, "TMDB_API_KEY")).toBe("xyz");
    expect(parseEnvFileValue("OPENAI_API_KEY=nope\n", "TMDB_API_KEY")).toBeUndefined();
    expect(parseEnvFileValue("NOEQUALS\nTMDB_API_KEY=ok\n", "TMDB_API_KEY")).toBe("ok");
  });
});

describe("resolveTmdbApiKey", () => {
  it("prefers an override, then the env var", () => {
    expect(resolveTmdbApiKey("  override  ", { TMDB_API_KEY: "env" })).toBe(
      "override",
    );
    expect(resolveTmdbApiKey(undefined, { TMDB_API_KEY: " env-key " })).toBe(
      "env-key",
    );
    expect(resolveTmdbApiKey(null, {})).toBeUndefined();
  });
});

describe("isTmdbBearerToken", () => {
  it("detects a JWT access token", () => {
    expect(isTmdbBearerToken("eyJhbGciOi.payload.sig")).toBe(true);
    expect(isTmdbBearerToken("0123456789abcdef0123456789abcdef")).toBe(false);
  });
});
