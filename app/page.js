// app/page.js
"use client";
import { useState } from "react";
import Link from "next/link";

export default function Landing() {
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState("");

  return (
    <main className="paper-container fade-in">
      {/* 1. Título imponente arriba */}
      <h1 className="title-main">
        AHORCADO <br /> 
        <span style={{ fontSize: '2rem', opacity: 0.8 }}>MULTIPLAYER</span>
      </h1>

      {/* 2. Eje Central (0,0) - Forzando centrado total */}
      <div className="center-axis w-full">
        
        {/* BOTÓN GENERAR */}
        <div className="flex justify-center w-full">
          <Link href="/create">
            <button className="key-btn btn-generate">
              GENERAR PARTIDA
            </button>
          </Link>
        </div>

        {/* BOTÓN UNIRME O INPUT */}
        <div className="flex justify-center w-full mt-4">
          {!showInput ? (
            <button 
              onClick={() => setShowInput(true)}
              className="key-btn btn-join"
            >
              UNIRME A SALA
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4 animate-fade-in w-full">
              <input
                type="text"
                placeholder="CÓDIGO"
                className="input-palabra text-2xl w-64 uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
              <div className="flex gap-6">
                <button className="font-bold underline text-ink">ENTRAR</button>
                <button onClick={() => setShowInput(false)} className="opacity-50 underline text-ink">ATRÁS</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Espaciador inferior para equilibrar el peso visual */}
      <div className="h-10"></div>
    </main>
  );
}