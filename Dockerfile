# 生产阶段
FROM nginx:stable-alpine

# 复制构建产物
COPY /dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
