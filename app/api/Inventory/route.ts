import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Configura tu conexión a MySQL
const db = mysql.createPool({
  host: "localhost", // Cambia según tu configuración
  user: "root", // Usuario de tu base de datos
  password: "", // Contraseña de tu base de datos
  database: "cosmetica-neurone", // Nombre de tu base de datos
});

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, stock } = body;

    await db.query("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", [
      name,
      price,
      stock,
    ]);
    return NextResponse.json({ message: "Producto agregado con éxito" });
  } catch (error) {
    return NextResponse.json({ error: "Error inserting data" }, { status: 500 });
  }
}
