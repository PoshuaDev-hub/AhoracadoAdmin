"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Landing() {
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState("");
  const [isValidRoom, setIsValidRoom] = useState(false);
  const router = useRouter();

  // Validación en tiempo real contra tu backend de Python
  useEffect(() => {
    const checkRoom = async () => {
      if (code.length === 6) {
        try {
          const res = await fetch(`http://127.0.0.1:8000/game/${code.toUpperCase()}`);
          if (res.ok) {
            setIsValidRoom(true);
          } else {
            setIsValidRoom(false);
          }
        } catch (err) {
          setIsValidRoom(false);
        }
      } else {
        setIsValidRoom(false);
      }
    };
    checkRoom();
  }, [code]);

  const handleJoin = () => {
    if (isValidRoom) {
      router.push(`/join/${code.toUpperCase()}`);
    }
  };

  return (
    <main className="paper-container flex flex-col items-center justify-center fade-in">
      <h1 className="title-main">
        AHORCADO <br /> 
        <span style={{ fontSize: '2rem', opacity: 0.8 }}>MULTIPLAYER</span>
      </h1>

      <div className="center-axis w-full">
        {!showInput ? (
          /* VISTA 1: El GAP del CSS (40px) separará estos dos automáticamente */
          <>
            <Link href="/create">
              <button className="key-btn btn-generate">GENERAR PARTIDA</button>
            </Link>
            
            <button 
              onClick={() => setShowInput(true)}
              className="key-btn btn-join" 
            >
              UNIRME A SALA
            </button>
          </>
        ) : (
          /* VISTA 2: El GAP de .animate-fade-in (30px) definido en CSS separará estos tres */
          <div className="animate-fade-in w-full flex flex-col items-center">
            <input
              type="text"
              placeholder="ESCRIBE EL CÓDIGO"
              className="key-btn btn-join text-center uppercase outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoFocus
            />

            <button 
              onClick={handleJoin}
              disabled={!isValidRoom}
              className={`key-btn w-64 py-4 transition-all duration-300 ${
                isValidRoom 
                ? "bg-green-500 border-green-700 text-white scale-105 shadow-[5px_5px_0px_#14532d]" 
                : "bg-gray-200 border-gray-400 text-gray-400 opacity-60 shadow-[2px_2px_0px_#94a3b8]"
              }`}
            >
              ENTRAR
            </button>

            <button 
              onClick={() => { setShowInput(false); setCode(""); }} 
              className="key-btn text-sm px-8 py-2 opacity-70 hover:opacity-100 mt-4"
            >
              ATRÁS
            </button>
          </div>
        )}
      </div>

      <div className="h-10"></div>
    </main>
  );
}