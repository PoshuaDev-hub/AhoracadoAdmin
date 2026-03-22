"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; 
import { Suspense } from "react";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const status = searchParams.get("status");
  const word = searchParams.get("word");
  const code = searchParams.get("code");

  const handleVolver = async () => {
    if (code) {
      try {
        await supabase
          .from('games')
          .delete()
          .eq('room_code', code.toUpperCase());
      } catch (err) {
        console.error("Error al limpiar DB:", err.message);
      }
    }
    router.push("/");
  };

  return (
    <>
      <div className="result-status-group">
        {status === "win" ? (
          <>
            <h1 className="result-title text-green-700 animate-bounce">
              ¡VICTORIA! 🏆
            </h1>
            <p className="font-handwriting result-subtitle">
              ¡Lograste salvarlo!
            </p>
          </>
        ) : (
          <>
            <h1 className="result-title text-red-700">
              GAME OVER 💀
            </h1>
            <p className="font-handwriting result-subtitle text-gray-600">
              La palabra era: <span className="font-bold underline">{word?.toUpperCase()}</span>
            </p>
          </>
        )}
      </div>

      <div className="result-actions-group">
        <p className="revancha-text">
          ¿Quieres revancha? Crea una sala nueva.
        </p>
        <button 
          onClick={handleVolver} 
          className="key-btn btn-result-volver"
        >
           VOLVER AL INICIO
        </button>
      </div>
    </>
  );
}

export default function ResultPage() {
  return (
    <main className="paper-container fade-in">
      <Suspense fallback={<div className="font-handwriting">Cargando resultados...</div>}>
        <ResultContent />
      </Suspense>
    </main>
  );
}