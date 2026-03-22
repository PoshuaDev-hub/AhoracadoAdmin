"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Teclado from "../../components/teclado";
import Ahorcado from "../../components/ahorcado";

export default function GamePage({ params }) {
  const { code } = use(params);
  const router = useRouter();
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  const shareData = {
    title: "Ahorcado Multiplayer",
    text: `¡Te desafío en mi partida de Ahorcado! Código: ${code?.toUpperCase()}`,
    url: typeof window !== "undefined" ? window.location.href : "",
  };

  // 1. Carga inicial
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/game/${code}`);
        if (!res.ok) throw new Error("No se halló la partida");
        const data = await res.json();
        setWord(data.word || ""); 
        setGuessedLetters(data.guessed_letters || []);
      } catch (err) {
        console.error("Error cargando juego:", err);
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchGame();
  }, [code]);

  // 2. Suscripción Realtime
  useEffect(() => {
    if (!code) return;
    const channel = supabase
      .channel(`room-${code}`)
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `room_code=eq.${code}` },
        (payload) => {
          if (payload.new.guessed_letters) {
            setGuessedLetters(payload.new.guessed_letters);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [code]);

  // Lógica de cálculo
  const errors = guessedLetters.filter(l => !word.toLowerCase().includes(l.toLowerCase())).length;
  // Comprobamos si todas las letras de la palabra secreta están enguessedLetters
  const isWinner = word.length > 0 && word.toLowerCase().split("").every(l => guessedLetters.includes(l.toLowerCase()));
  const isLoser = errors >= 6;

  // 3. REDIRECCIÓN ULTRA RÁPIDA
  useEffect(() => {
    if (isWinner || isLoser) {
      const status = isWinner ? "win" : "lose";
      // Reducimos a 300ms para una respuesta casi instantánea pero fluida
      const timer = setTimeout(() => {
        router.push(`/result?status=${status}&code=${code}&word=${word}`);
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [isWinner, isLoser, code, word, router]);

  const onKeyPress = async (letter) => {
    // Evitamos enviar si el juego ya terminó visualmente
    if (guessedLetters.includes(letter.toLowerCase()) || isWinner || isLoser) return;
    
    const newGuessed = [...guessedLetters, letter.toLowerCase()];
    setGuessedLetters(newGuessed);

    try {
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
        <span className="room-code-label">CÓDIGO DE SALA</span>
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
                {guessedLetters.includes(letter.toLowerCase()) 
                  ? letter.toUpperCase() 
                  : "_"} 
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
      </div>

      <div className="pb-6">
        <button onClick={handleShare} className="key-btn text-sm px-8 py-3">
          COMPARTIR PARTIDA
        </button>
      </div>
    </main>
  );
}