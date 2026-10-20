const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
app.use(express.json());
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "raktar_db"
});
app.get("/termekek", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                t.id,
                t.nev,
                t.ar,
                t.keszlet,
                t.elerheto,
                k.nev AS kategoria
            FROM termekek t
            JOIN kategoriak k
            ON t.kategoria_id = k.id
            ORDER BY t.ar
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ hiba: err.message });
    }
});
app.get("/termekek/elerheto", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT *
            FROM termekek
            WHERE elerheto = 1
            AND keszlet > 0
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ hiba: err.message });
    }
});
app.listen(3000, () => {
    console.log("Szerver fut: http://localhost:3000");
});