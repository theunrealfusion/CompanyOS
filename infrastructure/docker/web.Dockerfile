FROM node:20-alpine

WORKDIR /app/apps/web

# In development, we mount everything. We can just run vite directly if package.json is mounted.
# We will rely on an initialization script or command to npm install and then run.
CMD sh -c "npm install && npm run dev -- --host 0.0.0.0"
