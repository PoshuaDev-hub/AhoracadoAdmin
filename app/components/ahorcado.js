// app/components/ahorcado.js
"use client";

export default function Ahorcado({ errors }) {
  return (
    <svg height="200" width="200" className="mx-auto">
      {/* Horca */}
      <line x1="20" y1="180" x2="180" y2="180" stroke="black" strokeWidth="4" />
      <line x1="50" y1="180" x2="50" y2="20" stroke="black" strokeWidth="4" />
      <line x1="50" y1="20" x2="130" y2="20" stroke="black" strokeWidth="4" />
      <line x1="130" y1="20" x2="130" y2="50" stroke="black" strokeWidth="4" />

      {/* Cabeza */}
      {errors > 0 && <circle cx="130" cy="70" r="20" stroke="black" strokeWidth="3" fill="none" />}
      {/* Cuerpo */}
      {errors > 1 && <line x1="130" y1="90" x2="130" y2="140" stroke="black" strokeWidth="3" />}
      {/* Brazo Izquierdo */}
      {errors > 2 && <line x1="130" y1="110" x2="100" y2="90" stroke="black" strokeWidth="3" />}
      {/* Brazo Derecho */}
      {errors > 3 && <line x1="130" y1="110" x2="160" y2="90" stroke="black" strokeWidth="3" />}
      {/* Pierna Izquierda */}
      {errors > 4 && <line x1="130" y1="140" x2="110" y2="170" stroke="black" strokeWidth="3" />}
      {/* Pierna Derecha */}
      {errors > 5 && <line x1="130" y1="140" x2="150" y2="170" stroke="black" strokeWidth="3" />}
    </svg>
  );
}