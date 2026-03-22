"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function CreateGame() {
  const [word, setWord] = useState("");
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  // Función para generar un código de sala aleatorio (Lo que antes hacía Python)
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleStart = async () => {
    // Validación de longitud
    if (word.length < 3) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    try {
      const roomCode = generateRoomCode();

      // Insertamos directamente en la tabla 'games' de Supabase
      const { error } = await supabase
        .from('games')
        .insert([
          { 
            room_code: roomCode, 
            secret_word: word.toUpperCase(),
            status: 'waiting',
            guessed_letters: [] // Inicializamos el array de letras intentadas
          }
        ]);

      if (error) throw error;

      // Navegamos a la sala recién creada
      router.push(`/join/${roomCode}`);

    } catch (error) {
      console.error("Error al crear la sala:", error.message);
      alert("No se pudo crear la sala. Revisa tu conexión a Supabase.");
    }
  };

  return (
    <main className="paper-container fade-in no-zoom-area">
      <div className="pos-title">
        <h2 className="title-main" style={{ fontSize: '3rem' }}>Palabra <br /> Secreta</h2>
      </div>
      
      <div className="pos-input">
        {showError && <div className="error-bubble">¡Mínimo 3 letras!</div>}
        <input
          type="password"
          className="input-palabra"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          autoFocus
          placeholder="Escribe aquí..."
          autoComplete="off"
        />
      </div>

      <div className="pos-button">
        <button onClick={handleStart} className="key-btn text-xl px-10 py-3">
          LISTO, CREAR SALA
        </button>
      </div>
    </main>
  );
}