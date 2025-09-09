# StockScreener - GitHub Copilot Instructions

StockScreener is a web application for screening stocks based on fundamental parameters. The repository is currently in early development stage.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Repository Current State

**CRITICAL**: This repository is currently in early development with minimal code. As of this writing, it contains only a README.md file. The instructions below anticipate the typical development setup for a stock screening web application.

## Working Effectively

### Initial Setup (Current State)
- The repository currently contains only a README.md file
- When code is added, follow the setup instructions below
- Always check the current repository state before following build instructions

### Anticipated Development Setup (When Code is Added)

#### Prerequisites
- Install Node.js (version 18 or higher recommended)
- Install npm or yarn package manager
- Install Git

#### Bootstrap and Build Process
When the codebase is developed, the typical setup will likely be:
- `npm install` or `yarn install` -- installs dependencies
- `npm run build` -- builds the application. **NEVER CANCEL: May take 5-15 minutes. Set timeout to 30+ minutes.**
- `npm run dev` -- starts development server
- `npm run test` -- runs test suite. **NEVER CANCEL: May take 5-10 minutes. Set timeout to 20+ minutes.**

#### Development Commands (Anticipated)
- `npm run start` -- starts production server
- `npm run build:prod` -- production build
- `npm run lint` -- runs linting checks
- `npm run format` -- formats code
- `npm run type-check` -- TypeScript type checking

### Current Validation Steps
- Verify README.md exists and contains project description: `test -f README.md && echo "README exists" || echo "README missing"`
- Check repository contains only expected files: `find . -type f ! -path './.git/*' | sort`
- Verify git repository is properly initialized: `git status`
- Check for package.json when dependencies are added: `test -f package.json && echo "package.json exists" || echo "No package.json yet"`
- Ensure .gitignore is properly configured for Node.js projects when code is added

## Build and Test Timing Expectations

**CRITICAL TIMING NOTES:**
- **NEVER CANCEL any build or test command**
- npm install: 2-5 minutes (set timeout to 10+ minutes)
- Build commands: 5-15 minutes (set timeout to 30+ minutes)
- Test suites: 5-10 minutes (set timeout to 20+ minutes)
- Linting: 1-3 minutes (set timeout to 10+ minutes)

## Anticipated Technology Stack

Based on the project description, expect:
- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL or similar
- **APIs**: Stock market data providers (Alpha Vantage, IEX Cloud, etc.)
- **Testing**: Jest, React Testing Library
- **Build Tools**: Webpack, Vite, or Create React App

## Key Areas and Navigation

### Expected Directory Structure (When Developed)
```
/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Application pages
│   ├── services/      # API services
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── server/            # Backend API
├── public/            # Static assets
├── tests/             # Test files
├── docs/              # Documentation
└── package.json       # Dependencies and scripts
```

### Important Files to Monitor
- `package.json` -- project dependencies and scripts
- `tsconfig.json` -- TypeScript configuration
- `.env` files -- environment variables
- API service files -- stock data integration
- Component files -- UI components for stock screening

## Validation and Testing

### Manual Validation Requirements
When the application is developed, always validate:
- **Stock Data Retrieval**: Test fetching stock data from configured APIs
- **Filtering Interface**: Verify stock screening filters work correctly
- **Performance**: Ensure application handles large datasets efficiently
- **Responsive Design**: Test UI on different screen sizes

### Pre-commit Validation
Always run before committing:
- `npm run lint` -- code quality checks
- `npm run type-check` -- TypeScript validation
- `npm run test` -- unit and integration tests
- `npm run build` -- ensure production build succeeds

### CI/CD Integration
- Check `.github/workflows/` for automated build and test processes
- Ensure all CI checks pass before merging
- Monitor build times and adjust timeout expectations accordingly

## Development Workflow

### Adding New Features
1. **Always build and test first** to ensure clean starting state
2. Create feature branch from main
3. Implement changes incrementally
4. **Run validation steps frequently** during development
5. Test stock screening functionality manually
6. Ensure all automated tests pass
7. Run full build before creating PR

### Stock Market Data Considerations
- Always use test API keys during development
- Implement rate limiting to avoid API quota issues
- Cache frequently accessed data appropriately
- Handle API failures gracefully
- Validate data integrity from external sources

### Common Issues and Solutions
- **API Rate Limits**: Implement caching and request throttling
- **Large Datasets**: Use pagination and virtual scrolling
- **Real-time Updates**: Consider WebSocket connections for live data
- **Performance**: Monitor bundle size and optimize accordingly

## Security and Environment

### Environment Variables
- Never commit API keys or secrets
- Use `.env` files for local development
- Validate all environment variables are set before running
- Use different configurations for development, staging, and production

### Data Privacy
- Ensure stock market data usage complies with provider terms
- Implement appropriate data retention policies
- Consider user data privacy in any screening preferences storage

## Additional Notes

- **Always validate that every command works** before relying on these instructions
- **Document any deviations** from expected behavior
- **Update these instructions** when new patterns or requirements emerge
- **Set generous timeouts** for all build and test operations
- **Never cancel long-running operations** -- builds may take significant time

## Troubleshooting

### Common Commands for Investigation
- `npm ls` -- check installed packages
- `npm outdated` -- check for package updates
- `npm run` -- list available scripts
- `git status` -- check repository state
- `git log --oneline -10` -- recent commits

### When Instructions Fail
1. Check current repository state has changed
2. Verify Node.js and npm versions
3. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
4. Check for environment-specific issues
5. Update these instructions with new findings

## Current Repository State Reference

### Repository Files (Current)
```
find . -type f ! -path './.git/*' | sort
./.github/copilot-instructions.md
./README.md
```

### README Content (Current)
```
cat README.md
# StockScreener
A web application for screening stocks based on fundamental parameters
```

### Validation Commands Output (Current)
```
test -f README.md && echo "README exists" || echo "README missing"
README exists

test -f package.json && echo "package.json exists" || echo "No package.json yet"
No package.json yet
```

**Note**: Update this section when the repository structure changes.