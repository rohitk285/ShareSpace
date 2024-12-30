# setting exact version of nodejs
FROM node:22.4.1

# setting working directory inside the container
WORKDIR /app

COPY package.json .

RUN npm install

# copying the rest of the frontend code
COPY . .

# the client side should run on port 5173
EXPOSE 5173

# start the application
CMD ["npm","run","dev"]