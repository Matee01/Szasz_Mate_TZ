require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
db.connect((err) => {
    if (err) {
        console.log("Adatbázis hiba:");
        console.log(err);
    } else {
        console.log("Sikeres adatbázis kapcsolat!");
    }
});
app.get("/termekek", (req, res) => {

    const sql = `
        SELECT
            t.id,
            t.nev,
            t.ar,
            t.keszlet,
            t.elerheto,
            k.nev AS kategoria_nev
        FROM termekek t
        INNER JOIN kategoriak k
            ON t.kategoria_id = k.id
        ORDER BY t.ar ASC
    `;
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                hiba: err.message
            });
        }

        res.json(result);
    });

});
app.get("/termekek/elerheto", (req, res) => {

    const sql = `
        SELECT *
        FROM termekek
        WHERE elerheto = 1
        AND keszlet > 0
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                hiba: err.message
            });
        }

        res.json(result);

    });

});
app.get("/termekek/kereses/:szoveg", (req, res) => {

    const szoveg = req.params.szoveg;

    const sql = `
        SELECT *
        FROM termekek
        WHERE nev LIKE ?
    `;

    db.query(
        sql,
        [`%${szoveg}%`],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    hiba: err.message
                });
            }

            res.json(result);

        }
    );

});
app.get("/kategoriak/statisztika", (req, res) => {

    const sql = `
        SELECT
            k.nev AS kategoria_nev,
            COUNT(t.id) AS termekek_szama,
            ROUND(AVG(t.ar),1) AS atlagos_ar
        FROM kategoriak k
        INNER JOIN termekek t
            ON k.id = t.kategoria_id
        GROUP BY k.id, k.nev
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                hiba: err.message
            });
        }

        res.json(result);

    });

});
app.get("/termekek/dragak", (req, res) => {

    const sql = `
        SELECT
            nev,
            ar,
            keszlet
        FROM termekek
        WHERE ar > 10000
        ORDER BY keszlet DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                hiba: err.message
            });
        }

        res.json(result);

    });

});
app.post("/termekek", (req, res) => {

    const {
        kategoria_id,
        nev,
        ar,
        keszlet,
        elerheto
    } = req.body;

    const sql = `
        INSERT INTO termekek
        (
            kategoria_id,
            nev,
            ar,
            keszlet,
            elerheto
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [kategoria_id, nev, ar, keszlet, elerheto],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    hiba: err.message
                });
            }

            res.json({
                uzenet: "Sikeres hozzáadás",
                id: result.insertId
            });

        }
    );

});
app.delete("/termekek/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM termekek
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                hiba: err.message
            });
        }

        res.json({
            uzenet: "Sikeres törlés"
        });

    });

});
app.listen(process.env.PORT, () => {
    console.log(`Szerver fut a ${process.env.PORT} porton`);
});