# Use an official Node.js runtime as a base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install NestJS dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the NestJS application
RUN npm run build

# Expose ports for HTTP and HTTPS
EXPOSE 80
EXPOSE 443

# Set the command to run your application with HTTPS
CMD ["npm", "run", "start:prod"]
