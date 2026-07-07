import express from 'express';
const app = express();
const port = 4000;

app.get('/health', (req, res) => {
    res.json({status: 'ok'});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});