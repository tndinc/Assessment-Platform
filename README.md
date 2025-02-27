This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

after that run "npm install"
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Learn Supabase with Next.JS] https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs?queryGroups=language&language=ts
- [Learn shadcn with Nex.js] https://ui.shadcn.com/docs/installation/next


## GIT UPDATES FROM MAIN BRANCH TO YOUR BRANCH
1. optional: check if local repo is updated with remote repo:
   - git fetch origin
     - will update the references for origin/main
2. updating your branch:
     - merge main to your branch
     - git merge origin/main

## GIT MERGE BRANCH A TO BRANCH B
1. Switch to BRANCH B:
   - git checkout BRANCH B
2. merge BRANCH A into BRANCH B:
   - git merge BRANCH B
3. push changes:
   - git push origin BRANCH B
  
## PULL UPDATES FROM REMOTE REPO
1. ensure your branch is up-to-date:
   - git checkout your-branch-name
   - git fetch origin
   - git origin/main
2. switch to MAIN branch:
   - git checkout main
3. merge your branch into main
   - git merge your-branch-name
4. push changes (if needed)
   - git push
