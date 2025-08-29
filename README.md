# EPICGROUP LAB - Aplicación Educativa

Una aplicación moderna y responsiva para EPICGROUP LAB, construida con React, React Native y Supabase.

## 🚀 Características

- **Diseño Espacial**: Interfaz moderna con tema espacial y gradientes
- **Responsivo**: Optimizado para web y dispositivos móviles
- **Autenticación**: Sistema de login completo con Supabase
- **Animaciones**: Transiciones suaves y efectos visuales
- **TypeScript**: Código tipado para mayor robustez

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Estilos**: CSS personalizado con variables CSS
- **Base de Datos**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Enrutamiento**: React Router DOM

## 📱 Componentes

- **SplashScreen**: Pantalla de carga con animaciones
- **LoginScreen**: Formulario de autenticación
- **ProfileScreen**: Perfil del usuario
- **Logo**: Componente del logo de EPICGROUP LAB

## 🚀 Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd epicgroup-lab-app
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Edita el archivo `.env` con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador**
   ```
   http://localhost:3000
   ```

## 🗄️ Configuración de Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API para obtener las credenciales
4. Copia la URL y la clave anónima a tu archivo `.env`

## 📱 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 🎨 Personalización

### Colores
Los colores se pueden personalizar editando las variables CSS en `src/index.css`:

```css
:root {
  --primary-blue: #1a1a2e;
  --secondary-blue: #16213e;
  --accent-purple: #8b5cf6;
  --light-purple: #a78bfa;
  --white: #ffffff;
}
```

### Logo
El logo se puede personalizar editando el componente `Logo.tsx` y sus estilos.

## 📱 Responsividad

La aplicación está optimizada para:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 480px - 767px
- **Small Mobile**: < 480px

## 🔧 Estructura del Proyecto

```
epicgroup-lab-app/
├── src/
│   ├── components/
│   │   ├── Logo.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── App.css
├── package.json
├── vite.config.js
├── tsconfig.json
└── README.md
```

## 🚀 Despliegue

### Vercel
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Netlify
1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Build command: `npm run build`
4. Publish directory: `dist`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de EPICGROUP LAB.

---

**EPICGROUP LAB** - Innovación Educativa 🚀
