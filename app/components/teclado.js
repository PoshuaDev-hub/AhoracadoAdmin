"use client";

export default function Teclado({ onKeyPress, guessedLetters, currentWord }) {
  const letters = "ABCDEFGHIJKLMNÑOPQRSTU".split("");
  
  const getKeyClass = (letter) => {
    const isGuessed = guessedLetters.includes(letter.toLowerCase());
    const isCorrect = currentWord.toLowerCase().includes(letter.toLowerCase());
    if (isGuessed) return isCorrect ? "key-correct-used" : "key-wrong-used";
    return "key-idle";
  };

  return (
    <div className="teclado-container-pro">
      <div className="teclado-grid-fixed">
        {/* Letras A hasta U */}
        {letters.map((l) => (
          <button
            key={l}
            onClick={() => onKeyPress(l.toLowerCase())}
            disabled={guessedLetters.includes(l.toLowerCase())}
            className={`key-btn-small-pro ${getKeyClass(l)}`}
          >
            {l}
          </button>
        ))}

        {/* X posicionada debajo de la Ñ */}
        <button
          onClick={() => onKeyPress("x")}
          disabled={guessedLetters.includes("x")}
          className={`key-btn-small-pro ${getKeyClass("X")}`}
          style={{ gridColumnStart: 7 }}
        >
          X
        </button>

        {/* Y posicionada debajo de la O */}
        <button
          onClick={() => onKeyPress("y")}
          disabled={guessedLetters.includes("y")}
          className={`key-btn-small-pro ${getKeyClass("Y")}`}
          style={{ gridColumnStart: 8 }}
        >
          Y
        </button>

        {/* Z CENTRADA: Ocupa toda la fila final para poder centrarse */}
        <div className="fila-final-centrada">
          <button
            onClick={() => onKeyPress("z")}
            disabled={guessedLetters.includes("z")}
            className={`key-btn-small-pro ${getKeyClass("Z")}`}
          >
            Z
          </button>
        </div>
      </div>
    </div>
  );
}