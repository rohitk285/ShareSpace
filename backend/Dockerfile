# setting exact version of nodejs
FROM node:22.4.1

# setting working directory inside the container
WORKDIR /app

COPY package.json .

RUN npm install

# copying the rest of the backend code
COPY . .

# exposing the port
EXPOSE 3000

# Start the server using node
CMD ["node", "server"]