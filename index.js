import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";
 
const app = express();
const upload = multer();
const ai = new GoogleGenAI({});
 
// inisialisasi model AI
const geminiModels = {
    text: "gemini-2.5-flash-lite",
    image: "gemini-2.5-flash",
    audio: "gemini-2.5-flash",
    document: "gemini-2.5-flash-lite"
};
 
// inisialisasi aplikasi back-end/server
app.use(cors()); // .use() --> panggil/bikin middleware
// app.use(() => {}); --> pakai middleware sendiri
app.use(express.json()); // --> untuk membolehkan kita menggunakan 'Content-Type: application/json' di header
 
// inisialisasi route-nya
// .get(), .post(), .put(), .patch(), .delete() --> yang paling umum dipakai
// .options() --> lebih jarang dipakai, karena ini lebih ke preflight (untuk CORS umumnya)
 

//1. Generate Text
app.post('/generate-text', async (req, res) => {
    // handle bagaimana request diterima oleh user
    const { message } = req.body || {};
 
    if (!message || typeof message !== 'string') {
        res.status(400).json({ message: "Pesan tidak ada atau format-nya tidak sesuai." });
        return; // keluar lebih awal dari handler
    }
 
    const response = await ai.models.generateContent({
        contents: message,
        model: geminiModels.text
    });
 
    res.status(200).json({
        reply: response.text
    });
});

//2. Generate from image
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    try{
        const {prompt} = req.body;
        const imageBase64 = req.file.buffer.toString('base64');
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {text: prompt},
                {inlineData: {mimeType: req.file.mimeType, data: imageBase64}}
            ]
        });
        res.json({ reslut: extractText(resp) });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

//3. Generate from Document
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    try{
        const {prompt} = req.body;
        const docBase64 = req.file.buffer.toString('base64');
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {text: prompt || "Ringkas Dokumen Berikut:"},
                {inlineData: {mimeType: req.file.mimetype, data: docBase64}}
            ]
        });
        res.json({ reslut: extractText(resp) });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}); 


//3. Generate from Audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    try{
        const {prompt} = req.body;
        const audioBase64 = req.file.buffer.toString('base64');
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {text: prompt || "Transkrip audio berikut:"},
                {inlineData: {mimeType: req.file.mimetype, data: audioBase64}}
            ]
        });
        res.json({ reslut: extractText(resp) });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}); 

// panggil si app-nya di sini
const port = 3000;
 
app.listen(port, () => {
    console.log("I LOVE YOU", port);
});