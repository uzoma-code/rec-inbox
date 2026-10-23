# Student pack — bootstrap

**AI Building Intensive** — student pack. Created by [Melanie Brewer](https://www.linkedin.com/in/melaniebennettbrewer).  
Share and adapt with credit: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).  
[github.com/mmelb2003/AI-Building-Intensive](https://github.com/mmelb2003/AI-Building-Intensive)

This zip is a **crate**, not your app. Do not open this folder as the project you will build in.

## You

1. Create a **new empty folder**. In Cursor: **File → New Window → Open** that folder.
2. On GitHub: green **Code** button → **Download ZIP**.
3. Drag the zip (or the unzipped folder) into that empty project.
4. Set the agent to **Composer 2.5**. Paste:

> Read `README.md` inside the zip (or unzipped pack) in this folder. Follow it exactly. This folder is my app.

## Agent — do exactly this

There is a student pack in this workspace (`.zip` or unzipped folder). This folder is the app.

**Do not invent a product. Do not add features, APIs, OpenAI, or Neon. Do not write spec 001. Do not git clone.**

1. Unzip if needed. Find `student/`.
2. Copy only:
   - `student/DESIGN.md` → `DESIGN.md`
   - `student/themes/harbor.css` → `themes/harbor.css`
   - `student/cursor-pack/rules/` → `.cursor/rules/`
   - `student/cursor-pack/skills/spec-writing/` → `.cursor/skills/spec-writing/`
   - `student/cursor-pack/skills/session-handoff/` → `.cursor/skills/session-handoff/`
   - `student/cursor-pack/skills/pre-build-review/` → `.cursor/skills/pre-build-review/`
   - `student/cursor-pack/skills/product-interview/` → `.cursor/skills/product-interview/`
   - `student/cursor-pack/skills/writing-tests/` → `.cursor/skills/writing-tests/`
   - `student/.env.example` → `.env`
   - `student/PRD-Template.md` → `PRD.md`
   - `student/HANDOFF-Template.md` → `HANDOFF.md`
   - `student/specs/_template.md` → `specs/_template.md`
   - `student/specs/README-seed.md` → `specs/README.md`
   - `student/vitest.config.ts` → `vitest.config.ts`
   - `student/vitest.setup.ts` → `vitest.setup.ts`
3. Scaffold the Next.js shell in a subfolder so you do not fight existing files, then move it up:

   `npx create-next-app@latest _next --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes`

   Move `_next/` contents into this folder without overwriting `DESIGN.md`, `PRD.md`, `HANDOFF.md`, `.env`, `.cursor/`, `themes/`, `specs/`, `vitest.config.ts`, or `vitest.setup.ts`. Delete `_next`.
4. If `package.json` name is `_next` or `next-tmp`, set it to the folder name.
5. `npx shadcn@latest init -d`
6. `npx shadcn@latest add button card input label textarea badge select checkbox separator -y`
7. Paste tokens from `themes/harbor.css` into `app/globals.css` `:root`. Keep imports, `@theme`, and the base layer.
8. `npm install -D vitest @vitejs/plugin-react happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8`
   Add `"test": "vitest run --coverage"` to `package.json` scripts. Do not replace the other scripts. Do not run tests yet.
9. Leave `AGENTS.md` and `CLAUDE.md` if Next created them. Do not delete them — `next dev` puts them back.
10. **Delete** the zip and the extracted pack from this project. Do not leave `student/` here.
11. List what you created. **Stop.** Do not tell them to fill the PRD, write a spec, or start building — class will say what's next.

Look is Harbor. To rebrand later, change hex values in `DESIGN.md` and `app/globals.css` `:root`. Do not add a second design file.

Do not copy Loop examples (`PRD-Example-Loop.md`, `specs/Spec-Example-Loop.md`, `HANDOFF-Example-Loop.md`) unless the student is building Loop.
