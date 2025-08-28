import express from 'express';
import routes from '../routes/index.ts';

const app = express();

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => res.send("api ok"));

export default app;