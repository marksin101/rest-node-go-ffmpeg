FROM golang:latest AS build
WORKDIR /src
COPY go-tools/ .    
RUN go build -ldflags "-s -w" -o /out/goffmpeg .


FROM node:alpine
RUN apk add  --no-cache ffmpeg
RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
COPY --from=build /out/goffmpeg /usr/src/app/src/gobinary/
RUN rm -rf go-tools/
EXPOSE 3000
CMD [ "node", "server.js" ]