import app from "./app.js";
import dotenv from "dotenv";
import connectToDb from "./db/db.js";
import { WebSocketServer } from "ws";
import cookie from "cookie";
import { Message } from "./models/message.model.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required.");
}

const connectWithRetry = async (retries = 5, delay = 3000) => {
    try {
        await connectToDb();
        console.log("Connected to MongoDB");
    } catch (error) {
        if (retries === 0) {
            console.error("MongoDB connection failed after retries:", error.message);
            process.exit(1);
        } else {
            console.warn(`MongoDB connection failed. Retrying in ${delay / 1000}s...`);
            setTimeout(() => connectWithRetry(retries - 1, delay * 2), delay);
        }
    }
};

connectWithRetry()
    .then(() => {
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is listening on: ${process.env.PORT}`);
        });

        const wss = new WebSocketServer({ server });

        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        wss.on("connection", (connection, req) => {
            console.log("New WebSocket connection established.");

            const cookies = req.headers.cookie;
            if (cookies) {
                const parsedCookies = cookie.parse(cookies);
                const tokenCookieString = parsedCookies.token;

                jwt.verify(tokenCookieString, process.env.JWT_SECRET, {}, (err, decoded) => {
                    if (err) {
                        console.error("Invalid token:", err.message);
                        connection.close();
                        return;
                    }
                    const { userId, username } = decoded;
                    connection.userId = userId;
                    connection.username = username;
                });
            } else {
                console.warn("No cookies provided. Closing connection.");
                connection.close();
                return;
            }

            // Notify users about the new connection
            [...wss.clients]
                .filter(client => client.userId && client.username)
                .forEach(client => {
                    client.send(
                        JSON.stringify({
                            online: [...wss.clients]
                                .filter(c => c.userId && c.username)
                                .map(c => ({ userId: c.userId, username: c.username }))
                        })
                    );
                });

            connection.on("message", async (message) => {
                try {
                    const messageData = JSON.parse(message.toString());
                    const { recipient, text, file } = messageData;
                    let filename = null
                    if (file) {
                        const parts = file.name.split('.')
                        const ext = parts[parts.length - 1]
                        filename = Date.now() + '.' + ext
                        const filePath = path.join(uploadsDir, filename);
                        const buffer = new Buffer.from(file.data.split(',')[1], 'base64');
                        fs.writeFile(filePath, buffer, () => {
                            // console.log('file saved:' , filePath)
                        })
                    }

                    if (recipient && (text || file)) {
                        const messageDoc = await Message.create({
                            sender: connection.userId,
                            recipient,
                            text,
                            file : file ? filename : null
                        });
                        [...wss.clients]
                            .filter(c => c.userId === recipient)
                            .forEach(c => c.send(JSON.stringify({
                                sender: connection.userId,
                                recipient,
                                text,

                                _id: messageDoc._id,

                            })));

                        connection.send(JSON.stringify({ status: "sent", recipient, text }));
                    } else {
                        console.warn("Invalid message data:", messageData);
                    }
                } catch (err) {
                    console.error("Error parsing message:", err.message);
                }
            });

            connection.on("close", () => {
                console.log(`User disconnected: ${connection.userId}`);

                [...wss.clients].forEach(client => {
                    client.send(
                        JSON.stringify({
                            online: [...wss.clients]
                                .filter(c => c.userId && c.username)
                                .map(c => ({ userId: c.userId, username: c.username }))
                        })
                    );
                });
            });
        });
    })
    .catch((error) => console.error("MongoDB connection failed!!!", error));
