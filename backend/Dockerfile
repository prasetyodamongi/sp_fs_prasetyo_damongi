# Gunakan image Node.js resmi
FROM node:18

# Buat direktori kerja
WORKDIR /app

# Salin file dan install dependencies
COPY package*.json ./
RUN npm install

# Salin semua file project ke container
COPY . .

# Expose port (sesuai app.js)
EXPOSE 5000

# Jalankan server
CMD ["node", "app.js"]