FROM node:18-alpine
WORKDIR /app
COPY --chown=nextjs:nodejs ./dist/apps/frontend/.next/standalone ./
COPY --chown=nextjs:nodejs ./dist/apps/frontend/.next/static ./.next/static
COPY --chown=nextjs:nodejs ./dist/apps/frontend/public ./apps/frontend/public

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "./apps/frontend/server.js"]
