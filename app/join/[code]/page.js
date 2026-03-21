"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "../../lib/supabase"; // Asegúrate de tener este archivo creado
import Teclado from "../../components/teclado";
import Ahorcado from "../../components/ahorcado";

export default function GamePage({ params }) {
  const { code } = use(params);
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  const shareData = {
    title: "Ahorcado Multiplayer",
    text: `¡Te desafío en mi partida de Ahorcado! Código: ${code?.toUpperCase()}`,
    url: typeof window !== "undefined" ? window.location.href : "",
  };

  // 1. EFECTO: Carga inicial de la palabra (vía tu API de Python)
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/game/${code}`);
        if (!res.ok) throw new Error("No se halló la partida");
        const data = await res.json();
        setWord(data.word || data.palabra || ""); 
        // Sincronizamos letras ya adivinadas si la partida ya empezó
        setGuessedLetters(data.guessed_letters || []);
      } catch (err) {
        console.error("Error cargando juego:", err);
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchGame();
  }, [code]);

  // 2. EFECTO: Suscripción Realtime (vía Cliente Supabase JS)
  useEffect(() => {
    if (!code) return;

    const channel = supabase
      .channel(`room-${code}`)
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `room_code=eq.${code}` },
        (payload) => {
          // Si el cambio viene de la DB, actualizamos las letras en pantalla
          if (payload.new.guessed_letters) {
            setGuessedLetters(payload.new.guessed_letters);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  // Lógica de cálculo
  const errors = guessedLetters.filter(l => !word.toLowerCase().includes(l)).length;
  const isWinner = word.length > 0 && word.split("").every(l => guessedLetters.includes(l.toLowerCase()));
  const isLoser = errors >= 6;

  // 3. FUNCIÓN: Enviar la letra presionada al Backend
  const onKeyPress = async (letter) => {
    if (guessedLetters.includes(letter) || isWinner || isLoser) return;

    const newGuessed = [...guessedLetters, letter];
    
    // IMPORTANTE: Aquí actualizamos el estado local para feedback inmediato
    setGuessedLetters(newGuessed);

    try {
      // Avisamos a tu backend para que este actualice Supabase
      await fetch(`http://127.0.0.1:8000/game/${code}/guess`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          guessed_letters: newGuessed,
          errors: newGuessed.filter(l => !word.toLowerCase().includes(l)).length
        })
      });
    } catch (err) {
      console.error("Error enviando letra:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("¡Enlace copiado! 📋");
    }
  };

  if (loading) return (
    <main className="paper-container flex items-center justify-center">
      <h1 className="font-handwriting text-3xl animate-pulse">Cargando partida...</h1>
    </main>
  );

  return (
    <main className="paper-container fade-in no-zoom-area">
      <h1 className="pos-title-game">Ahorcado Multiplayer</h1>
      
      <div className="room-code-container">
        <span className="room-code-label">CÓDIGO DE SALA:</span>
        <span className="room-code-value">{code?.toUpperCase()}</span>
      </div>

      <div className="flex-grow flex flex-col items-center w-full mt-4">
        <div className="ahorcado-container">
          <Ahorcado errors={errors} />
        </div>
        
        <div className="guess-lines-container">
          {word.split("").map((letter, i) => (
            <div key={i} className="guess-line-wrapper">
              <span className="guess-letter">
                {guessedLetters.includes(letter.toLowerCase()) ? letter.toUpperCase() : ""}
              </span>
              <div className="underline-ink"></div>
            </div>
          ))}
        </div>

        {!isWinner && !isLoser && (
          <Teclado 
            onKeyPress={onKeyPress} 
            guessedLetters={guessedLetters} 
            currentWord={word} 
          />
        )}

        {isWinner && <h2 className="text-green-700 text-3xl font-bold animate-bounce mt-4">¡VICTORIA! 🏆</h2>}
        {isLoser && (
          <div className="text-center mt-4">
            <h2 className="text-red-700 text-xl font-bold uppercase">¡Has sido colgado!</h2>
            <p className="font-handwriting text-ink">La palabra era: <span className="font-bold">{word.toUpperCase()}</span></p>
          </div>
        )}
      </div>

      <div className="pb-6">
        <button onClick={handleShare} className="key-btn text-sm px-8 py-3">
          COMPARTIR PARTIDA
        </button>
      </div>
    </main>
  );
}