FROM 10.64.250.16/changan/nginx:frontend

ARG path=./prod

COPY ${path} /usr/share/nginx/html/

CMD ["nginx","-g","daemon off;"]