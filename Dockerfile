FROM nginx:1.10
MAINTAINER bangomc@gmail.com
COPY /public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
