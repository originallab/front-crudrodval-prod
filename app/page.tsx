import { redirect } from "next/navigation";

export default function Home() {
  redirect("/contenedoresInfo/datosBasicos"); // Redirige automáticamente a la página de contenedores
  return null; // No necesitas renderizar nada aquí
}
