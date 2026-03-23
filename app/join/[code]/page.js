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

  // 1. CARGA INICIAL (Directo de Supabase)
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('secret_word, guessed_letters')
          .eq('room_code', code.toUpperCase())
          .single();

        if (error || !data) throw new Error("No se halló la partida");

        setWord(data.secret_word || ""); 
        setGuessedLetters(data.guessed_letters || []);
      } catch (err) {
        console.error("Error cargando juego:", err);
        router.push("/"); // Si falla, volvemos al inicio
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchGame();
  }, [code, router]);

  // 2. SUSCRIPCIÓN REALTIME (Ya la tenías bien, pero aseguramos el canal)
  useEffect(() => {
    if (!code) return;
    
    const channel = supabase
      .channel(`room-${code}`)
      .on(
        'postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'games', 
          filter: `room_code=eq.${code.toUpperCase()}` 
        },
        (payload) => {
          // Si otro jugador marca una letra, se actualiza en tu pantalla al instante
          if (payload.new.guessed_letters) {
            setGuessedLetters(payload.new.guessed_letters);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [code]);

  // Lógica de cálculo (Mantenemos tu lógica de ingeniería)
  const errors = guessedLetters.filter(l => !word.toLowerCase().includes(l.toLowerCase())).length;
  const isWinner = word.length > 0 && word.toLowerCase().split("").every(l => guessedLetters.includes(l.toLowerCase()));
  const isLoser = errors >= 6;

  // 3. REDIRECCIÓN AL TERMINAR
  useEffect(() => {
    if (isWinner || isLoser) {
      const status = isWinner ? "win" : "lose";
      const timer = setTimeout(() => {
        router.push(`/result?status=${status}&code=${code}&word=${word}`);
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [isWinner, isLoser, code, word, router]);

  // 4. ACTUALIZAR LETRAS (En lugar de PATCH a Python, UPDATE a Supabase)
  const onKeyPress = async (letter) => {
    const lowerLetter = letter.toLowerCase();
    if (guessedLetters.includes(lowerLetter) || isWinner || isLoser) return;
    
    const newGuessed = [...guessedLetters, lowerLetter];
    
    // Actualización optimista (se ve en tu pantalla de inmediato)
    setGuessedLetters(newGuessed);

    try {
      const { error } = await supabase
        .from('games')
        .update({ guessed_letters: newGuessed })
        .eq('room_code', code.toUpperCase());

      if (error) throw error;
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
      <h1 className="pos-title-game text-center text-2xl mb-2">Ahorcado Multiplayer</h1>
      
      <div className="room-code-container">
        <span className="room-code-label">CÓDIGO DE SALA</span>
        <span className="room-code-value font-bold">{code?.toUpperCase()}</span>
      </div>

      <div className="flex-grow flex flex-col items-center w-full mt-4">
        <div className="ahorcado-container">
          <Ahorcado errors={errors} />
        </div>
        
        <div className="guess-lines-container flex flex-wrap justify-center gap-2 my-8">
          {word.split("").map((letter, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl font-handwriting">
                {guessedLetters.includes(letter.toLowerCase()) 
                  ? letter.toUpperCase() 
                  : ""} 
              </span>
              <div className="w-6 h-1 bg-current opacity-30 mt-1"></div>
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
