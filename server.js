import express from "express";
import { editarUsuarios, eliminarUsuario, getTransferencias, insertarUsuario, leerUsuario, nuevaTransferencia } from "./utilities/db.js";
import { verificaTransferencia } from "./utilities/tools.js";

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
        const estado = await insertarUsuario(data.nombre, data.balance);
        if (estado == true) {
            res.status(201).json({ todo: 'ok' });
        } else {
            res.status(400).json(estado)
        }

    })
})

app.put('/usuario', async(req, res) => {
    const id = req.query.id;
    const data = req.body;
    const estado = await editarUsuarios(id, data.name, data.balance);
    if (estado == true) {
        res.status(202).json({ todo: 'ok' });
    } else {
        res.status(401).send(estado)
    }
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
        const estado = await nuevaTransferencia(data.emisor, data.receptor, data.monto);
        if (estado == true) {
            res.status(201).json({ todo: 'ok' });
        } else {
            res.status(400).json(estado)
        }
    })
})

app.get('/transferencias', async(req, res) => {
    const data = await getTransferencias()
    res.status(200).json(data);
})




app.listen(3000, () => console.log('servidor funcionando en el puerto 3000'));