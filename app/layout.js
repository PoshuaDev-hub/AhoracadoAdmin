// app/layout.js
import "./style/styles.css";

export const metadata = {
  title: "Ahorcado FullStack",
  description: "Juego de portafolio de Joshua Chiguay",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Forzamos el meta tag para asegurar el bloqueo en iOS/Android */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body>{children}</body>
    </html>
  );
}