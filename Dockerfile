FROM node:onbuild

RUN ./node_modules/.bin/gulp

EXPOSE 80

CMD ./node_modules/.bin/pm2 start dist/app.js --name ES2015-In-Action --no-daemon