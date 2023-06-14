FROM node:alpine
WORKDIR /app
COPY ./dist/apps/backend .
ENV PORT=3333
EXPOSE ${PORT}
RUN npm install --production && npm install pg
ENV DATABASE_HOST db
ENV DATABASE_PORT 5432
ENV DATABASE_DATABASE postgres
ENV DATABASE_USERNAME postgres
ENV DATABASE_PASSWORD postgres
CMD node ./main.js
