const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.post("/api/ask", async (req, res) => {
try {
const { question, subject } = req.body;

    console.log("SAVOL KELDI:", req.body);

    if (!question || !question.trim()) {
        return res.status(400).json({
            error: "Iltimos, savol yozing."
        });
    }

    const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.GROQ_API_KEY
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: "Sen AI USTOZsan. " + (subject || "Umumiy fan") +
                            " bo'yicha o'quvchiga o'zbek tilida sodda, tushunarli va misollar bilan javob ber."
                    },
                    {
                        role: "user",
                        content: question
                    }
                ]
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Groq API xatosi");
    }

    res.json({
        answer: data.choices[0].message.content
    });

} catch (error) {
    console.error("AI XATOLIGI:", error.message);

    res.status(500).json({
        error: error.message
    });
}
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
    console.log("AI USTOZ serveri ishga tushdi!");
});