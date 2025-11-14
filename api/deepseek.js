// /api/deepseek.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { message } = req.body;

    const encoder = new TextEncoder();

    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });

    try {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.DEEPSEEK_API_KEY
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                stream: true,
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: message }
                ]
            })
        });

        const reader = response.body.getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            res.write(encoder.encode(`data: ${new TextDecoder().decode(value)}\n\n`));
        }

        res.end();
    } catch (err) {
        console.error(err);
        res.write(`data: ERROR\n\n`);
        res.end();
    }
}
