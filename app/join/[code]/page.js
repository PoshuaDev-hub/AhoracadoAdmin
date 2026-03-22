import GameClient from "./GameClient";

// Ponemos un código de ejemplo solo para que el compilador vea que "hay algo"
export async function generateStaticParams() {
  return [{ code: 'SALA12' }]; 
}

// Forzamos a que no intente buscar nada más en tiempo de compilación
export const dynamicParams = false;

export default function Page({ params }) {
  return <GameClient params={params} />;
}