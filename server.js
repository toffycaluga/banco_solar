import express from "express";
import { editarUsuarios, eliminarUsuario, getTransferencias, insertarUsuario, leerUsuario, nuevaTransferencia } from "./utilities/db.js";

const app = express();

app.use(express.static('static'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send('todo ok');
})

app.get('/usuarios', async(req, res) => {
    const data = await leerUsuario();
    res.status(200).json(data);
})

app.post('/usuario', (req, res) => {
    let body = ''
    req.on('data', (data) => body += data)
    req.on('end', async() => {
        const data = JSON.parse(body)
        await insertarUsuario(data.nombre, data.balance);
        res.status(200).send('todo ok');
    })
})

app.put('/usuario', async(req, res) => {
    const id = req.query.id;
    const data = req.body;
    await editarUsuarios(id, data.name, data.balance);
    res.status(200).send('todo ok');

})

app.delete('/usuario', async(req, res) => {
    const id = req.query.id;
    await eliminarUsuario(id);
    res.status(200).send('todo ok');
})

app.post('/transferencia', async(req, res) => {
    let body = ''
    req.on('data', data => body += data)
    req.on('end', async() => {
        const data = JSON.parse(body)
        await nuevaTransferencia(data.emisor, data.receptor, data.monto)
        res.status(200).json({ todo: 'ok' });
    })
})

app.get('/transferencias', async(req, res) => {
    const data = await getTransferencias()
    res.status(200).json(data);
})




app.listen(3000, () => console.log('servidor funcionando en el puerto 3000'));