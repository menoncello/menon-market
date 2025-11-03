import { test, expect } from "bun:test";
import { program } from "./generate";

test("CLI program has generate command", () => {
  const commands = program.commands.map((cmd) => cmd.name());
  expect(commands).toContain("generate");
});

test("CLI program has list command", () => {
  const commands = program.commands.map((cmd) => cmd.name());
  expect(commands).toContain("list");
});