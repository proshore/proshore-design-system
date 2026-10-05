#!/usr/bin/env node
// proshore-ui-init: installs the Claude instructions of @proshore/ui into the current project.
//   npx proshore-ui-init
// Copies the skill to .claude/skills/proshore-ui and adds (or refreshes) a marked section in CLAUDE.md. Safe to run again after an upgrade.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const project = process.cwd();
const skillFrom = join(here, "skills", "proshore-ui");
const skillTo = join(project, ".claude", "skills", "proshore-ui");
mkdirSync(dirname(skillTo), { recursive: true });
rmSync(skillTo, { recursive: true, force: true });
cpSync(skillFrom, skillTo, { recursive: true });

const START = "<!-- proshore-ui:start -->", END = "<!-- proshore-ui:end -->";
const snippet = `${START}\n${readFileSync(join(here, "CLAUDE-snippet.md"), "utf8").trim()}\n${END}\n`;
const file = join(project, "CLAUDE.md");
let text = existsSync(file) ? readFileSync(file, "utf8") : "";
const a = text.indexOf(START), b = text.indexOf(END);
if (a >= 0 && b > a) text = text.slice(0, a) + snippet + text.slice(b + END.length).replace(/^\n/, "");
else text = (text ? text.replace(/\s*$/, "\n\n") : "") + snippet;
writeFileSync(file, text);
console.log(`Installed the Proshore UI skill: ${resolve(skillTo)}\nUpdated the design system section in: ${resolve(file)}\nStart a new Claude session in this project so it picks up the skill.`);
