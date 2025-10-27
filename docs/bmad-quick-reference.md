# BMAD Quick Reference - menon-market

## Story Loop
```bash
# 3. Implementation
/bmad:bmm:agents:dev
*develop                     # Implement story (quality gates run automatically)
                            # TypeScript 0, ESLint 0, Tests 100% enforced
```

## Quality Checks
```bash
# 4. Quality Checks
/bmad:bmm:agents:tea
*test-review                 # Review test quality

/bmad:bmm:agents:dev
*review                      # Code review (includes quality gates verification)
```

## Tips
- Quality gates are mandatory - TypeScript 0, ESLint 0, Tests 100%
- NEVER use eslint-disable or @ts-ignore - fix underlying issues
- Use 'bun test' for running tests (not turbo commands)
- All code must pass TypeScript strict mode compilation