import app from "./shared/http/app.ts";

const PORT = process.env.PORT_BACKEND;

app.listen(PORT, () => {
    console.log(`servidor on na porta ${PORT}`);
});