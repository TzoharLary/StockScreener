# GitHub Copilot Instructions for Pull Request Documentation

## Core Rule
For **every new Pull Request (PR)**, you must create a **new Markdown file** (`.md`).  
Inside this file, you must add a **new section** describing the changes introduced by the PR.

## Writing Guidelines
1. **Language**: All documentation must be written in **Hebrew**, with very high-level, fluent writing.  
2. **Level of Detail**: Describe changes at the **macro level** only.  
   - Do **not** describe lines of code or specific commits.  
   - Instead, explain:  
     - What was the problem.  
     - How we approached solving it.  
     - How the problem was resolved.  
3. **Visual Presentation**:  
   - All text must be written **right-to-left** (RTL).  
   - Align text to the **right**.  
   - Use clear and hierarchical **headings**.  
   - Emphasize key points with **bullet points** and bold text.  

## Workflow
- Before writing a new section, **always read previous Markdown files** to gather full context.  
- Then, add a **new section** for the current PR, following the same structure and style.  

## Example Section Structure
```markdown
# Changes in the Stock Filter System – October 2025

## Problem
- The system did not support filtering by Debt-to-Equity ratio.  
- Users struggled to add a new filter.  

## Solution
- Implemented a more flexible filter structure.  
- Added validation mechanisms for API data.  

## Result
- The system now supports filtering by Debt-to-Equity.  
- Future filters can be added more easily.