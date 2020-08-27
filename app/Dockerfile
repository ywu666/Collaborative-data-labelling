FROM python:3.8-alpine
WORKDIR /app
COPY . /app/.
RUN apk add npm
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]