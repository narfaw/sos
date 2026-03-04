# Sözyer Forum

## Kurulum (Bilgisayarda)

```bash
# 1. Bu klasörü aç, terminalde şunu çalıştır:
npm install

# 2. Geliştirme sunucusunu başlat:
npm run dev

# 3. Tarayıcıda aç: http://localhost:5173
```

## Vercel'e Yükleme

1. https://github.com adresine git, ücretsiz hesap aç
2. Yeni repo oluştur → bu klasördeki dosyaları yükle
3. https://vercel.com adresine git → "Import Project" → GitHub reposunu seç
4. Build ayarları otomatik gelir → "Deploy" tıkla
5. Birkaç dakikada site yayında!

## Netlify'a Yükleme

1. `npm run build` komutu çalıştır → `dist/` klasörü oluşur
2. https://netlify.com → "Deploy manually" → `dist/` klasörünü sürükle bırak
3. Site anında yayında!

## Admin Hesabı

- Email: `admin@forum.com`
- Şifre: herhangi bir şey (min 6 karakter)

## Notlar

- Veriler şu an bellekte tutuluyor (sayfa yenilenince sıfırlanır)
- Kalıcı veri için Firebase veya Supabase entegrasyonu gerekir
