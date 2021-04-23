FROM ubuntu:18.04

RUN apt-get update

ENV HOME /root

WORKDIR /root

RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_12.x| bash
RUN apt-get update --fix-missing
RUN apt-get install -y nodejs


COPY . .



RUN rm package-lock.json
RUN npm install -d



EXPOSE 8000

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait 

CMD /wait && npm start